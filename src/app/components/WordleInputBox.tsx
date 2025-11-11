"use client"
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"
import Swal from "sweetalert2";
import { pickDifficulty } from "../page";

export default function WordleInputBox() {
    // Uses useState to control the word and useRef to focus() to each input box.
    const [word, setWord] = useState(["", "", "", "", ""]);
    const inputRefs = useRef<HTMLInputElement[] | null[]>([]);
    const router = useRouter();

    // Once user clicks on the form (5 input boxes), it automatically focuses to the correct input box allowing
    // the user to type smoothly without pressing/clicking keys.
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

    // Does some action based on what key is pressed:
    // Backspace, deletes the current input and goes to previous input
    // Enter, submits and gets feedback on the word from backend
    // Letter keys, updates word and moves onto next character box.
    const handleOnKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        const key = e.key;
        const newWord = [...word]

        if (key === "Enter" && word[4] !== "") {
            // Reset the input boxes to empty
            inputRefs.current.forEach((input, i) => {
                if (input) {
                    input.value = "";
                    newWord[i] = "";
                }
            });
            // Change focus to the first input box
            inputRefs.current[0]?.focus();

            try {
                // Sends POST to backend and wait for feedback
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
                // Displays different popup depending on the feedback from backend
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
                            pickDifficulty();
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

    // Displays a working 5 grid inputbox
    return (
        <div className="flex justify-center">
            <form className="flex" onClick={handleFormClick}>
                {["1", "2", "3", "4", "5"].map((v, i) => {
                    return (
                        <div key={v}>
                            <input className={`flex h-19 w-19 sm:h-23 sm:w-23 md:h-25 md:w-25 text-6xl sm:text-7xl md:text-8xl text-center uppercase font-black focus:outline-0 
                            border-4 ${v === "5" ? "border-r-4" : "border-r-0"} border-green-800`}
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