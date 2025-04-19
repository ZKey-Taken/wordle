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
                httpOnly: true,
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
        const givenWord = getWordData(data);
        const cookie = cookies();
        const index = (await cookie).get("WordIndex")?.value
        if (typeof index === "undefined" || givenWord === null) {
            return NextResponse.json({ correctness: correctness, status: 400 });
        }
        const word = fiveLetterWordArray[parseInt(index)];

        for (let i = 0; i < 5; i++) {
            if (word[i] === givenWord[i].toLowerCase()) {
                correctness[i] = "Green";
            } else if (word.includes(givenWord[i].toLowerCase())) {
                correctness[i] = "Yellow";
            } else {
                correctness[i] = "Gray";
            }
        }

        return NextResponse.json({ correctness: correctness, status: 200 });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ correctness: correctness, status: 500 });
}