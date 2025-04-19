import Link from "next/link";
import WordleInputBox from "../components/WordleInputBox";
import DisplayGuesses from "../components/DisplayGuesses";

export default function Play() {
    return (
        <div className="flex flex-col h-screen w-full">
            <Link href={"/"} className="flex text-3xl text-center font-blod justify-center p-5">
                Wordle
            </Link>
            <WordleInputBox />
            <hr className="my-5" />
            <DisplayGuesses />
        </div>
    )
}