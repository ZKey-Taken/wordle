interface DisplayGuessesProp {
    guessWord: string[];
    guessCorrectness: string[][];
}

export default function DisplayGuesses({ guessWord, guessCorrectness }: DisplayGuessesProp) {
    console.log(guessWord);
    console.log(guessCorrectness);
    return (
        <div className="flex">
            DisplayGuesses
        </div>
    )
}