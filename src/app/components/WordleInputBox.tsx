"use client"
import { useState } from "react"

export default function WordleInputBox() {
    const [index, setIndex] = useState(0);

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;

        if (key === "Backspace") {

        } else if (/^[a-zA-Z]$/.test(key)) {

        }
    }

    return (
        <div className="flex justify-center">
            <form className="flex">
                {["1", "2", "3", "4", "5"].map((v) => {
                    return (
                        <div key={v}>
                            <input className={`flex h-25 w-25 text-8xl text-center focus:outline-0 
                            border-2 ${v === "5" ? "border-r-2" : "border-r-0"} border-amber-500`}
                                id={v} maxLength={1} required
                                onKeyDown={(e) => { handleOnKeyDown(e) }}
                            />
                        </div>
                    )
                })}
            </form>
        </div>
    )
}