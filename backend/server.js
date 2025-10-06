require("dotenv").config()
const jwt = require("jsonwebtoken")
const express = require("express")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")
const cors = require('cors')

// datbase setup
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        balance REAL DEFAULT 100.0,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `).run()
})

createTables()

const app = express()

app.set("view engine", "ejs")
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(function (req, res, next) {
    res.locals.errors = []

    // try to decode cookie or Authorization header
    let token = null
    
    // First try cookie
    if (req.cookies.plinkoApp) {
        token = req.cookies.plinkoApp
    }
    // Then try Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7)
    }

    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.JWTSECRET)
            req.user = decoded
        } else {
            req.user = false
        }
    } catch(err) {
        req.user = false
    }

    res.locals.user = req.user

    console.log(req.user)

    next()
})

app.get('/user', (req, res) => {
    console.log('=== /user endpoint hit ===')
    console.log('req.cookies:', req.cookies)
    console.log('req.user:', req.user)
    
    if (!req.user) {
        console.log('No user found, sending 401')
        return res.status(401).send({error: "Not authenticated"})    
    }

    const getUserStatement = db.prepare("SELECT id, username, balance, last_login FROM users WHERE id = ?")
    const userData = getUserStatement.get(req.user.userid)

    if (!userData) {
        console.log('User not found in database')
        return res.status(404).send({error: "User not found"})
    }

    console.log('Sending user data:', userData)
    res.json(userData)
})

app.post('/bet', (req, res) => {
    if (!req.user) {
        return res.status(401).send({error: "Not authenticated"})
    }

    const { balls, bias, betAmount } = req.body;

    // Validate inputs
    if (!betAmount || betAmount <= 0) {
        return res.status(400).send({error: "Invalid bet amount"})
    }

    const parsedBetAmount = parseFloat(betAmount)
    const parsedBalls = parseInt(balls) || 1
    const parsedBias = parseFloat(bias) || 0

    // Get user's current balance
    const getUserStatement = db.prepare("SELECT balance FROM users WHERE id = ?")
    const userData = getUserStatement.get(req.user.userid)

    if (!userData) {
        return res.status(404).send({error: "User not found"})
    }

    // Check if user has enough balance for all balls
    const totalCost = parsedBetAmount * parsedBalls
    if (userData.balance < totalCost) {
        return res.status(400).send({error: "Insufficient balance for all balls"})
    }

    res.json({
        success: true,
        betAmount: parsedBetAmount,
        totalCost: totalCost,
        currentBalance: userData.balance,
        gameParams: {
            balls: parsedBalls,
            bias: parsedBias,
            betAmount: parsedBetAmount
        }
    })
})

app.post('/drop-ball', (req, res) => {
    if (!req.user) {
        return res.status(401).send({error: "Not authenticated"})
    }

    const { betAmount } = req.body;

    if (!betAmount || betAmount <= 0) {
        return res.status(400).send({error: "Invalid bet amount"})
    }

    const parsedBetAmount = parseFloat(betAmount)

    // Get user's current balance
    const getUserStatement = db.prepare("SELECT balance FROM users WHERE id = ?")
    const userData = getUserStatement.get(req.user.userid)

    if (!userData) {
        return res.status(404).send({error: "User not found"})
    }

    if (userData.balance < parsedBetAmount) {
        return res.status(400).send({error: "Insufficient balance"})
    }

    // Deduct bet amount for this ball
    const updateBalanceStatement = db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?")
    updateBalanceStatement.run(parsedBetAmount, req.user.userid)

    // Get updated balance
    const updatedUserData = getUserStatement.get(req.user.userid)

    res.json({
        success: true,
        betAmount: parsedBetAmount,
        newBalance: updatedUserData.balance
    })
})

app.post('/ball-payout', (req, res) => {
    if (!req.user) {
        return res.status(401).send({error: "Not authenticated"})
    }

    const { betAmount, multiplier } = req.body;

    if (!betAmount || betAmount <= 0 || !multiplier || multiplier < 0) {
        return res.status(400).send({error: "Invalid payout data"})
    }

    const parsedBetAmount = parseFloat(betAmount)
    const parsedMultiplier = parseFloat(multiplier)
    const payout = parsedBetAmount * parsedMultiplier

    // Add payout to balance
    const addPayoutStatement = db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?")
    addPayoutStatement.run(payout, req.user.userid)

    // Get updated balance
    const getUserStatement = db.prepare("SELECT balance FROM users WHERE id = ?")
    const updatedUserData = getUserStatement.get(req.user.userid)

    res.json({
        success: true,
        payout: payout,
        multiplier: parsedMultiplier,
        newBalance: updatedUserData.balance
    })
})

app.get('/', (req, res) => {
    res.render("homepage")
})

app.post('/login', (req, res) => {
    const errors = [] // check for validation
    let { username, password } = req.body

    if (typeof username !== "string") username = ""
    if (typeof password !== "string") password = ""

    username = username.trim()

    if (!username) errors.push("You must provide a username")
    if (!password) errors.push("You must provide a password")

    if (errors.length) {
        return res.send({errorList: errors})
    }

    // send user to database
    const lookupStatement = db.prepare("SELECT * FROM users WHERE username = ?")
    const ourUser = lookupStatement.get(username)

    if (!ourUser) {
        res.status(400)
        return res.send({errorList: ["Invalid username or password"]})
    }

    const passwordMatch = bcrypt.compareSync(password, ourUser.password)

    if (!passwordMatch) {
        res.status(400)
        return res.send({errorList: ["Invalid username or password"]})
    }

    // Update last_login time
    const updateLastLogin = db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")
    updateLastLogin.run(ourUser.id)

    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60* 24), userid: ourUser.id, username: ourUser.username}, process.env.JWTSECRET)

    res.status(200)
    res.send({success: true, message: "Login successful", token: ourTokenValue})
})

app.get('/register', (req, res) => {

})

app.post('/register', (req, res) => {
    const errors = [] // check for validation
    let { username, password } = req.body

    if (typeof username !== "string") username = ""
    if (typeof password !== "string") password = ""

    username = username.trim()

    if (!username) errors.push("You must provide a username")
    if (username && username.length < 3) errors.push("Username must exceed 3 characters")
    if (username && username.length > 10) errors.push("username cannot exceed 10 characters")
    if (username && !username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only be numbers and letters")

    // check if username exists
    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?")
    const usernameCheck = usernameStatement.get(username)

    if (usernameCheck) return res.send({errorList: ["Username is already taken"]})

    // valid password
    if (!password) errors.push("You must provide a password")
    if (password && password.length < 3) errors.push("password must exceed 3 characters")
    if (password && !password.match(/^[a-zA-Z0-9]+$/)) errors.push("password can only be numbers and letters")

    if (errors.length) {
        return res.send({errorList: errors})
    }

    // send user to database
    const salt = bcrypt.genSaltSync(10)
    password = bcrypt.hashSync(password, salt)

    const insertSignup = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    const result = insertSignup.run(username, password)

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    // log user in by sending cookie
    const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), userid: ourUser.id, username: ourUser.username}, process.env.JWTSECRET)

    res.status(200)
    res.send({success: true, message: "Thank you for registering", token: token})
})

app.listen(6700)