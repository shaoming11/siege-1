"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [ loggedIn] = useState(false);

  // redirect if logged in
  useEffect(() => {
    if (loggedIn) {
      router.push('/plinko', undefined)
    }
  }, [loggedIn, router])

  return (
    <div className="w-full">
      <NavigationMenu className="p-4 w-full flex justify-between flex-row text-white bg-black">
        <NavigationMenuList className="w-full flex justify-center">
          <NavigationMenuItem className="p-4"><Link href='/dashboard'>Dashboard</Link></NavigationMenuItem>
          <NavigationMenuItem className="p-4"><Link href='/login'>Login</Link></NavigationMenuItem>
          <NavigationMenuItem className="p-4"><Link href='/login'>Sign Up</Link></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="">
        <Button>Press here to play plinko balls</Button>
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
