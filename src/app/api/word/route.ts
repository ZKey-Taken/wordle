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

const checkWordle = (givenWord: string, correctWord: string) => {
    const correctness: string[] = Array(5).fill("Gray");
    const usedLetter = Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
        if (correctWord[i] === givenWord[i]) {
            correctness[i] = "Green";
            usedLetter[i] = true;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (correctness[i] === "Gray" && !usedLetter[i]) {
            for (let j = 0; j < 5; j++) {
                if (givenWord[i] === correctWord[j] && !usedLetter[j]) {
                    correctness[i] = "Yellow";
                    usedLetter[j] = true;
                    break;
                }
            }
        }
    }

    return correctness
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
    let correctness: string[] = [];
    try {
        const data = await req.json();
        const givenWord = getWordData(data)?.toLowerCase();
        const cookie = cookies();
        const index = (await cookie).get("WordIndex")?.value;
        const guessesCookie = (await cookie).get("Guesses")?.value;
        const correctnessCookie = (await cookie).get("Correctness")?.value;

        if (typeof index === "undefined" || typeof givenWord === "undefined"
            || typeof guessesCookie === "undefined" || typeof correctnessCookie === "undefined"
        ) {
            return NextResponse.json({ correctness: correctness, status: 400 });
        }

        const guessesArr: string[] = JSON.parse(guessesCookie);
        const correctnessArr: string[][] = JSON.parse(correctnessCookie);
        const word = fiveLetterWordArray[parseInt(index)];

        if (!fiveLetterWordArray.includes(givenWord)) {
            return NextResponse.json({ correctness: correctness, notValidWord: true, status: 400 });
        } else if (guessesArr.includes(givenWord)) {
            return NextResponse.json({ correctness: correctness, sameWord: true, status: 400 });
        }

        correctness = checkWordle(givenWord, word);

        let gameover = 0; // 0 = not over, 1 = win, 2 = lose
        if (correctness[0] === "Green" && correctness[1] === "Green" && correctness[2] === "Green" &&
            correctness[3] === "Green" && correctness[4] === "Green"
        ) {
            gameover = 1;
        } else if (guessesArr.length === 5 && gameover !== 1) {
            gameover = 2;
        }

        (await cookie).set("Guesses", JSON.stringify([...guessesArr, givenWord]));
        (await cookie).set("Correctness", JSON.stringify([...correctnessArr, correctness]));

        if (gameover !== 0) {
            (await cookie).delete("WordIndex");
            (await cookie).delete("Guesses");
            (await cookie).delete("Correctness");
            return NextResponse.json({ guesses: guessesArr.length.toString(), word: word, gameover: gameover, status: 200 });
        }

        return NextResponse.json({ correctness: correctness, gameover: 0, status: 200 });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ correctness: correctness, status: 500 });
}