"use client"
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"
import Swal from "sweetalert2";
import { generateWord } from "../page";

export default function WordleInputBox() {
    const [word, setWord] = useState(["", "", "", "", ""]);
    const inputRefs = useRef<HTMLInputElement[] | null[]>([]);
    const router = useRouter();

    const handleFormClick = (e: React.MouseEvent) => {
        e.preventDefault();

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

        if (key === "Enter" && word[4] !== "") {
            inputRefs.current.forEach((input, i) => {
                if (input) {
                    input.value = "";
                    newWord[i] = "";
                }
            });
            inputRefs.current[0]?.focus();

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
                if ("status" in data && data.status === 200 && "gameover" in data && data.gameover !== 0) {
                    let title = "", text = "";
                    if (data.gameover === 1) {
                        title = "You got it!";
                        text = "You took " + data.guesses + " tries";
                    } else if (data.gameover === 2) {
                        title = "Unfortunate!";
                        text = "The word was " + data.word;
                    }
                    Swal.fire({
                        title: title,
                        text: text,
                        icon: data.gameover === 1 ? 'success' : 'error',
                        confirmButtonText: "Play again?",
                        showDenyButton: true,
                        denyButtonText: "Back to Home",
                        denyButtonColor: "#3085d6",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            generateWord();
                            router.refresh();
                        } else {
                            router.push('/');
                        }
                    });
                } else if ("notValidWord" in data && data.notValidWord) {
                    Swal.fire({
                        text: "Not a valid word",
                        icon: "warning",
                        showConfirmButton: false,
                        timer: 1250,
                    });
                } else if ("sameWord" in data && data.sameWord) {
                    Swal.fire({
                        text: "Already guessed that word",
                        icon: "warning",
                        showConfirmButton: false,
                        timer: 1500,
                    });
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