import Swal from "sweetalert2";

// Send GET api call to backend to generate a random word
const generateWord = async (difficulty: string) => {
    const params = new URLSearchParams({ difficulty });
    try {
        await fetch(`/api/word?${params}`, {
            method: "GET",
        });
    } catch (error) {
        console.log(error);
    }
}

export const pickDifficulty = async () => {
    const inputOptions = new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                "easy": "easy",
                "medium": "medium",
                "hard": "hard",
            });
        }, 100);
    });
    const { value: difficulty } = await Swal.fire({
        title: "Select Difficulty",
        input: "radio",
        inputOptions,
        inputValidator: (value) => {
            if (!value) {
                return "You need to choose a difficulty!";
            }
        }
    });

    if (difficulty) {
        await generateWord(difficulty);
    }
}