import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from 'node:fs';
import wordListPath from 'word-list';

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const fiveLetterWordArray = wordArray.filter(word => word.length === 5);

export async function GET() {
    const cookie = cookies();
    const exists = (await cookie).get("WordIndex");

    if (typeof exists === "undefined") {
        const randomIndex = Math.floor(Math.random() * wordArray.length);
        (await cookie).set("WordIndex", randomIndex.toString(), {
            path: '/',
            maxAge: 60 * 60,
            httpOnly: true,
            sameSite: "strict"
        });
    }

    return NextResponse.json({ status: 200 })
}

export async function POST(req: Request) {
    const cookie = cookies();
    const index = (await cookie).get("WordIndex")?.value
    if (typeof index === "undefined") {
        return NextResponse.json({ status: 500 });
    }

    const word = fiveLetterWordArray[parseInt(index)];

    return NextResponse.json({ status: 200 });
}