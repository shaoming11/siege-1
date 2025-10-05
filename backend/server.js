require("dotenv").config()
const jwt = require("jsonwebtoken")
const express = require("express")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")

// datbase setup
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `).run()
})

createTables()

const app = express()

app.set("view engine", "ejs")
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use(function (req, res, next) {
    res.locals.errors = []

    // try to decode cookie
    try {
        const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET)
        req.user = decoded
    } catch(err) {
        req.user = false
    }

    res.locals.user = req.user

    console.log(req.user)

    next()
})

app.post('/bet', (req, res) => {

})

app.get('/', (req, res) => {
    res.render("homepage")
})

app.get('/login', (req, res) => {
    res.render("login")
})

app.post('/register', (req, res) => {
    const errors = [] // check for validation

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a username")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must exceed 3 characters")
    if (req.body.password && req.body.username.length > 10) errors.push("username cannot exceed 10 characters")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only be numbers and letters")

    if (!req.body.password) errors.push("You must provide a password")
    if (req.body.password && req.body.password.length < 3) errors.push("password must exceed 3 characters")
    if (req.body.password && !req.body.password.match(/^[a-zA-Z0-9]+$/)) errors.push("password can only be numbers and letters")

    if (errors.length) {
        return res.render("homepage", {errors})
    }

    // send user to database
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    const result = ourStatement.run(req.body.username, req.body.password)

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    // log user in by sending cookie
    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000), userid: ourUser.id, username: ourUser.username}, process.env.JWTSECRET)

    res.cookie("ourSimpleApp", ourTokenValue, {
        httpOnly: true,
        secure: true, // only https connection
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.send("Thank you for filling out the form")
})

app.listen(6700)