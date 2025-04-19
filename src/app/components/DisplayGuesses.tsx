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
        const parseCookies = (): Record<string, string> => {
            return document.cookie.split("; ").reduce((acc, curr) => {
                const [key, val] = curr.split("=");
                acc[key] = val;
                return acc;
            }, {} as Record<string, string>);
        };

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
        const interval = setInterval(updateCookies, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1">
            {guessWords.map((v, i) => {
                return (
                    <div key={v} className="flex justify-center">
                        {[v[0], v[1], v[2], v[3], v[4]].map((v, i) => {
                            return (
                                <div key={i} className="flex h-25 w-25 text-8xl text-center justify-center uppercase">
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