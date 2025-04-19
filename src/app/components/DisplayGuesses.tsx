export default function DisplayGuesses() {

    return (
        <div className="flex-1">
            {guessWord.map((v, i) => {
                return (
                    <div key={v} className="flex justify-center">
                        {[v[0], v[1], v[2], v[3], v[4]].map((v, i) => {
                            return (
                                <div key={i} className="flex h-25 w-25 text-8xl text-center justify-center uppercase">
                                    {v}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}