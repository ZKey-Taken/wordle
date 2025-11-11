import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { words } from "popular-english-words/words.js";

const fiveLetterWords = words.filter(word => word.length === 5);
const wordPoolLength = 5000;

const startIdx = {
    "easy": 0,
    "medium": wordPoolLength,
    "hard": wordPoolLength * 2,
}

const endIdx = {
    "easy": wordPoolLength + startIdx.easy,
    "medium": wordPoolLength + startIdx.medium,
    "hard": wordPoolLength + startIdx.hard,
}

// Verifies data and ensure it's a word that's a string
const getWordData = (data: unknown) => {
    if (data !== null && typeof data === "object" && "word" in data && typeof data.word === "string") {
        return data.word;
    }
    return null;
}

// Runs a two-pass Wordle check:
// 1) Mark Greens (correct position). 2) For remaining positions, mark Yellows limited by remaining occurrences in correctWord.
// This properly handles repeated-letter edge cases.
const checkWordle = (givenWord: string, correctWord: string) => {
    // Normalize inputs to lower-case strings
    const gw = (givenWord || "").toLowerCase();
    const cw = (correctWord || "").toLowerCase();

    // If lengths aren't 5, operate on up to 5 chars but ensure we return 5 results.
    const L = 5;
    const correctness: string[] = Array(L).fill("Gray");

    // First pass: mark greens and count remaining letters in the answer
    const remainingCounts: Record<string, number> = {};
    for (let i = 0; i < L; i++) {
        const gChar = gw[i] || "";
        const cChar = cw[i] || "";
        if (gChar && cChar && gChar === cChar) {
            correctness[i] = "Green";
        } else {
            // count this answer letter for potential yellow matches
            if (cChar) {
                remainingCounts[cChar] = (remainingCounts[cChar] || 0) + 1;
            }
        }
    }

    // Second pass: for non-green guessed positions, assign Yellow if the letter exists in remainingCounts
    for (let i = 0; i < L; i++) {
        if (correctness[i] !== "Green") {
            const gChar = gw[i] || "";
            if (gChar && remainingCounts[gChar] > 0) {
                correctness[i] = "Yellow";
                remainingCounts[gChar] -= 1;
            }
        }
    }

    return correctness;
}

// GET sets up the randomized index we will use to identify out word. The word list is static so we can just
// store an index and get the word when needed, frontend/user won't know the word.
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const difficulty = searchParams.get('difficulty');

        const cookie = cookies();
        const wordIndexExists = (await cookie).get("WordIndex");
        const guessesExists = (await cookie).get("Guesses");
        const correctnessExists = (await cookie).get("Correctness");
        let start = startIdx.easy, end = endIdx.easy;

        if (difficulty === "medium") {
            start = startIdx.medium
            end = endIdx.medium
        } else if (difficulty === "hard") {
            start = startIdx.hard
            end = endIdx.hard
        }

        if (typeof wordIndexExists === "undefined") {
            const randomIndex = Math.floor(Math.random() * (end - start + 1)) + start;
            (await cookie).set("WordIndex", randomIndex.toString(), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "strict"
            });
        }
        if (typeof guessesExists === 'undefined') {
            (await cookie).set("Guesses", JSON.stringify([]), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "strict"
            });
        }
        if (typeof correctnessExists === 'undefined') {
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

// POST does the heavy lifting of the wordle
// It obtains the user's word and verifies and constructs feedback based on the secret word.
// It returns many different things, allowing us to identify correctness, how many guesses, did the user win/lose,
// is the word user entered a valid word, and did the user enter a word that's already guessed.
// And it resets the cookies once the game is over.
export async function POST(req: Request) {
    let correctness: string[] = [];
    try {
        // Establishes variables
        const data = await req.json();
        const givenWord = getWordData(data)?.toLowerCase();
        const cookie = cookies();
        const index = (await cookie).get("WordIndex")?.value;
        const guessesCookie = (await cookie).get("Guesses")?.value;
        const correctnessCookie = (await cookie).get("Correctness")?.value;

        if (typeof index === "undefined" || typeof givenWord === "undefined"
            || typeof guessesCookie === "undefined" || typeof correctnessCookie === "undefined"
        ) {
            return NextResponse.json({ correctness: correctness, status: 400 }); // error, things not found
        }

        const guessesArr: string[] = JSON.parse(guessesCookie);
        const correctnessArr: string[][] = JSON.parse(correctnessCookie);
        const word = fiveLetterWords[parseInt(index)];

        if (!fiveLetterWords.includes(givenWord)) { // Not a valid word
            return NextResponse.json({ correctness: correctness, notValidWord: true, status: 400 });
        } else if (guessesArr.includes(givenWord)) { // Already guessed this word
            return NextResponse.json({ correctness: correctness, sameWord: true, status: 400 });
        }

        correctness = checkWordle(givenWord, word); // verifies word

        let gameover = 0; // 0 = not over, 1 = win, 2 = lose
        if (correctness[0] === "Green" && correctness[1] === "Green" && correctness[2] === "Green" &&
            correctness[3] === "Green" && correctness[4] === "Green"
        ) {
            gameover = 1;
        } else if (guessesArr.length === 5 && gameover !== 1) {
            gameover = 2;
        }

        // Update cookies
        (await cookie).set("Guesses", JSON.stringify([...guessesArr, givenWord]));
        (await cookie).set("Correctness", JSON.stringify([...correctnessArr, correctness]));

        if (gameover !== 0) { // reset cookies
            (await cookie).delete("WordIndex");
            (await cookie).delete("Guesses");
            (await cookie).delete("Correctness");
            return NextResponse.json({ guesses: (guessesArr.length + 1).toString(), word: word, gameover: gameover, status: 200 });
        }

        return NextResponse.json({ correctness: correctness, gameover: 0, status: 200 });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ correctness: correctness, status: 500 });
}