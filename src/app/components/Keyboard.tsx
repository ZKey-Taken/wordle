"use client";
import { useEffect, useState } from "react";

type LetterStatus = "unused" | "absent" | "present" | "correct";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const statusPriority = (a: LetterStatus, b: LetterStatus) => {
    const order: Record<LetterStatus, number> = { correct: 3, present: 2, absent: 1, unused: 0 };
    return order[a] >= order[b] ? a : b;
}

export default function Keyboard() {
    const [letterStatus, setLetterStatus] = useState<Record<string, LetterStatus>>(() => {
        const map: Record<string, LetterStatus> = {};
        for (let i = 65; i <= 90; i++) map[String.fromCharCode(i)] = "unused";
        return map;
    });

    useEffect(() => {
        const parseCookies = (): Record<string, string> => {
            return document.cookie.split("; ").reduce((acc, curr) => {
                const [key, val] = curr.split("=");
                acc[key] = val;
                return acc;
            }, {} as Record<string, string>);
        };

        const update = () => {
            const cookies = parseCookies();
            if (!cookies.Guesses || !cookies.Correctness) return;

            try {
                const guesses = JSON.parse(decodeURIComponent(cookies.Guesses)) as string[];
                const correctness = JSON.parse(decodeURIComponent(cookies.Correctness)) as string[][];

                const map: Record<string, LetterStatus> = {};
                for (let i = 65; i <= 90; i++) map[String.fromCharCode(i)] = "unused";

                for (let r = 0; r < guesses.length; r++) {
                    const g = (guesses[r] || "").toUpperCase();
                    const row = correctness[r] || [];
                    for (let i = 0; i < g.length; i++) {
                        const ch = g[i];
                        if (!ch || !/[A-Z]/.test(ch)) continue;
                        const state = (row[i] || "Gray").toString();
                        let s: LetterStatus = "unused";
                        if (state === "Green") s = "correct";
                        else if (state === "Yellow") s = "present";
                        else s = "absent";

                        // keep highest-priority status
                        map[ch] = statusPriority(s, map[ch]);
                    }
                }

                setLetterStatus(map);
            } catch {
                // ignore parse errors
            }
        };

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    const renderKey = (ch: string) => {
        const s = letterStatus[ch] || "unused";
        const base = "flex items-center justify-center rounded px-2 py-2 mx-1 my-1 text-sm font-bold select-none min-w-[36px]"
        const classes = s === "correct" ? `${base} bg-green-600 text-white` : s === "present" ? `${base} bg-yellow-500 text-white` : s === "absent" ? `${base} bg-gray-600 text-white` : `${base} bg-neutral-200 dark:bg-neutral-700 text-black`;
        return (
            <div key={ch} className={classes} aria-hidden>
                {ch}
            </div>
        )
    }

    return (
        // center keyboard inside a max-width container so it stays centered and larger than the guesses area
        <div className="w-full flex justify-center mt-4">
            <div className="w-full max-w-[720px] px-4 sm:px-8">
                {ROWS.map((row) => (
                    <div key={row} className="w-full flex justify-center">
                        {row.split("").map(renderKey)}
                    </div>
                ))}
            </div>
        </div>
    )
}
