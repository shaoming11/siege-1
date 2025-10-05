"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"

export default function Home() {
  const balance = 100; // replace
  const router = useRouter()
  const [ loggedIn, setLoggedIn] = useState(true);

  // redirect if logged in
  useEffect(() => {
    if (loggedIn) {
      router.push('/plinko', undefined)
    }
  }, [])

  return (
    <div>

      <div className="hidden">
        <Button>Press here to play plinko balls</Button>
        <p>
          table of contents
        </p>
        <h1 className="text-9xl">gambling</h1>
        <p className="text-5xl py-5">
          Your current balance: {balance}
        </p>
        <h2>how does this game work?</h2>
        <p>
          basically every hour or 10 minutes u get 100 coins to gamble and u can decide whether or not u wanna gamble and theres a leaderboard somewhere
        </p>
        <p>
          mvp will be just flip a coin
          then make it so u can do higher risk lower probability
        </p>
      </div>
    </div>
  );
}
