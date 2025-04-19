"use client"
import Link from "next/link";
import WordleInputBox from "../components/WordleInputBox";
import { useEffect, useState } from "react";
import DisplayGuesses from "../components/DisplayGuesses";

export default function Play() {
    const [words, setWords] = useState<string[]>([]);
    const [correctness, setCorrectness] = useState<string[][]>([]);

    const handleWord = (words: string[], correctness: string[][]) => {
        setWords(words);
        setCorrectness(correctness);
    }

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
            <WordleInputBox onWordEntered={handleWord} />
            <hr className="mt-5" />
            <DisplayGuesses guessWord={words} guessCorrectness={correctness} />
        </div>
    )
}