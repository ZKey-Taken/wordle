import WordleInputBox from "../components/WordleInputBox";
import DisplayGuesses from "../components/DisplayGuesses";
import Keyboard from "../components/Keyboard";

export default function Play() {
    return (
        <div className="flex flex-col h-screen w-full font-[family-name:var(--font-iceland)] pt-4">
            <WordleInputBox />
            <hr className="my-5" />
            <DisplayGuesses />
            <Keyboard />
        </div>
    )
}