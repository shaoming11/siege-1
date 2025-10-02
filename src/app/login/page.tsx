"use client"

export default function Login() {
    return(
        <div className="px-50">
            <h1 className="text-9xl">plinko balls!</h1>
            <p>Username</p>
            <input type="text" placeholder="Username" className="border-4 p-1"/>
            <p>Password</p>
            <input type="text" placeholder="Password" className="border-4 p-1"/>
        </div>
    )
}