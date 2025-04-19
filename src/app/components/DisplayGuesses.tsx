"use client";
import { useState, useEffect, useRef } from "react";

export default function DisplayGuesses() {
    const [guessWords, setGuessWords] = useState<string[]>([]);
    const [correctness, setCorrectness] = useState<string[][]>([]);
    const previousCookies = useRef<{ Guesses: string; Correctness: string }>({
        Guesses: "",
        Correctness: ""
    });

    useEffect(() => {
        // Obtain cookies from built-in js
        const parseCookies = (): Record<string, string> => {
            return document.cookie.split("; ").reduce((acc, curr) => {
                const [key, val] = curr.split("=");
                acc[key] = val;
                return acc;
            }, {} as Record<string, string>);
        };

        // Updates cookies if they changed
        const updateCookies = () => {
            const cookies = parseCookies();

            if (
                cookies.Guesses &&
                cookies.Correctness &&
                (cookies.Guesses !== previousCookies.current.Guesses ||
                    cookies.Correctness !== previousCookies.current.Correctness)
            ) {
                try {
                    const parsedGuesses = JSON.parse(decodeURIComponent(cookies.Guesses));
                    const parsedCorrectness = JSON.parse(decodeURIComponent(cookies.Correctness));

                    setGuessWords(parsedGuesses);
                    setCorrectness(parsedCorrectness);

                    previousCookies.current = {
                        Guesses: cookies.Guesses,
                        Correctness: cookies.Correctness
                    };
                } catch (err) {
                    console.error("Failed to parse cookies:", err);
                }
            }
        };

        updateCookies();
        const interval = setInterval(updateCookies, 1000); // Refreshes page every second to integrate changes
        return () => clearInterval(interval);
    }, []);

    // Loops every character of every word, displays each letter in its own box and color the background based
    // on each character index's correctness
    return (
        <div className="flex-1">
            {guessWords.map((v, i1) => {
                return (
                    <div key={v} className="flex justify-center">
                        {[v[0], v[1], v[2], v[3], v[4]].map((v, i2) => {
                            return (
                                <div key={i2} className={`flex h-25 w-25 text-8xl text-center justify-center uppercase border-y-2 border-black
                                    ${correctness[i1][i2] === "Green" ? "bg-green-600" : ""}
                                    ${correctness[i1][i2] === "Yellow" ? "bg-yellow-600" : ""}
                                    ${correctness[i1][i2] === "Gray" ? "bg-gray-600" : ""}
                                `}>
                                    {v}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}