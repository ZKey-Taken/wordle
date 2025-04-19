import Link from "next/link";
import WordleInputBox from "../components/WordleInputBox";

export default function Play() {
    return (
        <div
            className="flex flex-col h-screen w-full"
        >
            <Link href={"/"} className="flex text-3xl text-center justify-center p-5">
                Wordle
            </Link>
            <WordleInputBox />
        </div>
    )
}