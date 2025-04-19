import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from 'node:fs';
import wordListPath from 'word-list';

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const fiveLetterWordArray = wordArray.filter(word => word.length === 5);

const getWordData = (data: unknown) => {
    if (data !== null && typeof data === "object" && "word" in data && typeof data.word === "string") {
        return data.word;
    }
    return null;
}

export async function GET() {
    try {
        const cookie = cookies();
        const exists = (await cookie).get("WordIndex");

        if (typeof exists === "undefined") {
            const randomIndex = Math.floor(Math.random() * fiveLetterWordArray.length);
            (await cookie).set("WordIndex", randomIndex.toString(), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "strict"
            });
            (await cookie).set("Guesses", JSON.stringify([]), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "strict"
            });
            (await cookie).set("Correctness", JSON.stringify([]), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "strict"
            });
        }

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ status: 500 });
}

export async function POST(req: Request) {
    const correctness: string[] = [];
    try {
        const data = await req.json();
        const givenWord = getWordData(data)?.toLowerCase();
        const cookie = cookies();
        const index = (await cookie).get("WordIndex")?.value;
        if (typeof index === "undefined" || typeof givenWord === "undefined") {
            return NextResponse.json({ correctness: correctness, status: 400 });
        }
        const word = fiveLetterWordArray[parseInt(index)];

        for (let i = 0; i < 5; i++) {
            if (word[i] === givenWord[i]) {
                correctness[i] = "Green";
            } else if (word.includes(givenWord[i])) {
                correctness[i] = "Yellow";
            } else {
                correctness[i] = "Gray";
            }
        }

        if (correctness[0] === "Green" && correctness[1] === "Green" && correctness[2] === "Green" &&
            correctness[3] === "Green" && correctness[4] === "Green"
        ) {
            (await cookie).delete("WordIndex");
            (await cookie).delete("Guesses");
            (await cookie).delete("Correctness");
        }

        const guessesCookie = (await cookie).get("Guesses");
        const correctnessCookie = (await cookie).get("Correctness");

        if (typeof guessesCookie !== "undefined" && typeof correctnessCookie !== "undefined") {
            const guessesArr: string[] = JSON.parse(guessesCookie.value);
            const correctnessArr: string[][] = JSON.parse(correctnessCookie.value);

            (await cookie).set("Guesses", JSON.stringify([...guessesArr, givenWord]));
            (await cookie).set("Correctness", JSON.stringify([...correctnessArr, correctness]));
        }

        return NextResponse.json({ correctness: correctness, status: 200 });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ correctness: correctness, status: 500 });
}