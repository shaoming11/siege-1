"use client";

import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("./app"), { ssr: false });

export default function Plinko() {
    return (
        <div>
            <AppWithoutSSR/>
        </div>
    )
}