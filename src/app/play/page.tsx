"use client"
import Link from "next/link";
import WordleInputBox from "../components/WordleInputBox";
import { useEffect } from "react";

export default function Play() {
    useEffect(() => {
        const generateWord = async () => {
            try {
                await fetch("/api/word", {
                    method: "GET"
                });
            } catch (error) {
                console.log(error);
            }
        }
        generateWord();
    });
    return (
        <div className="flex flex-col h-screen w-full">
            <Link href={"/"} className="flex text-3xl text-center justify-center p-5">
                Wordle
            </Link>
            <WordleInputBox />
            <hr className="mt-5" />
        </div>
    )
}