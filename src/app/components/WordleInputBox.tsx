"use client"
import { useRef, useState } from "react"

interface WordleInputBoxProp {
    onWordEntered: (words: string[], correctness: string[][]) => void,
}

export default function WordleInputBox({ onWordEntered }: WordleInputBoxProp) {
    const [word, setWord] = useState(["", "", "", "", ""]);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [guessCorrectness, setGuessCorrectness] = useState<string[][]>([]);
    const inputRefs = useRef<HTMLInputElement[] | null[]>([]);

    const handleFormClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        let index = 0;
        while (index < 4) {
            if (inputRefs.current[index] !== null && word[index] === "") {
                break;
            }
            index++;
        }
        inputRefs.current[index]?.focus();
    }

    const handleOnKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        const key = e.key;
        const newWord = [...word]

        if (key === "Enter" && word[4] !== "" && guesses.length < 6) {
            try {
                const w = word.join("").substring(0, 5);
                const res = await fetch("/api/word", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        word: w,
                    })
                });
                const data = await res.json();
                if ("status" in data && data.status === 200 && "correctness" in data) {
                    const newGuesses = [...guesses, w];
                    const newCorrectness = [...guessCorrectness, data.correctness];
                    setGuesses(newGuesses);
                    setGuessCorrectness(newCorrectness);
                    onWordEntered(newGuesses, newCorrectness);
                }
            } catch (error) {
                console.log(error);
            }
        } else if (key === "Backspace") {
            if (word[idx] === "") {
                idx--;
                inputRefs.current[idx]?.focus();
            }
            for (let i = idx; i < 5; i++) {
                newWord[i] = "";
            }
        } else if (/^[a-zA-Z]$/.test(key)) {
            if (word[idx] !== "") {
                idx++;
                inputRefs.current[idx]?.focus();
            }
            newWord[idx] = key;
        }
        setWord(newWord)
    }

    return (
        <div className="flex justify-center">
            <form className="flex" onClick={handleFormClick}>
                {["1", "2", "3", "4", "5"].map((v, i) => {
                    return (
                        <div key={v}>
                            <input className={`flex h-25 w-25 text-8xl text-center uppercase font-black focus:outline-0 
                            border-2 ${v === "5" ? "border-r-2" : "border-r-0"} border-amber-500`}
                                id={v} maxLength={1} required autoFocus={i === 0}
                                onKeyDown={(e) => { handleOnKeyDown(e, i) }}
                                ref={(e) => { inputRefs.current[i] = e }}
                            />
                        </div>
                    )
                })}
            </form>
        </div>
    )
}