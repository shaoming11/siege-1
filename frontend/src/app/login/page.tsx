"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
    const [ username, setUsername ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ loggedIn, setLoggedIn ] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:6700/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username, password: password})
            });
            
            if (response.status === 200) {
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('plinkoToken', data.token);
                    console.log('success')
                    router.push('/plinko')
                }
            }
        } catch(error) {
            console.error(error);   
        }
    }

    const handleSignup = async () => {
        try {
            const response = await fetch('http://localhost:6700/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username, password: password})
            });
            
            if (response.status === 200) {
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('plinkoToken', data.token);
                    console.log('success')
                    router.push('/plinko')
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    return(
        <div className="px-50">
            <h1 className="text-9xl">plinko balls!</h1>
            <p>Username</p>
            <input type="text" placeholder="Username" className="border-4 p-1" onChange={(e) => setUsername(e.target.value)}/>
            <p>Password</p>
            <input type="text" placeholder="Password" className="border-4 p-1" onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={handleLogin} className="hover:cursor-pointer block border-4 mt-4 p-2">Login</button>
            <button onClick={handleSignup} className="hover:cursor-pointer block border-4 mt-4 p-2">Signup</button>
        </div>
    )
}