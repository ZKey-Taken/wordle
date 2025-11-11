"use client";
import Link from "next/link";
import Image from "next/image";
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

export default function Home() {
  return (
    <div className="flex flex-col h-screen text-center justify-center font-[family-name:var(--font-iceland)] font-bold">
      <div className="flex justify-center">
        <Image src={"/wordle.jpg"} alt="" width={400} height={400} priority />
      </div>
      <p className="pt-3 pb-5 text-5xl font-bold text-sky-300">
        Infinite Wordle
      </p>
      <div className="flex justify-center text-3xl">
        <Link href={"/play"} onClick={pickDifficulty} className="flex px-5 py-2 rounded-2xl bg-amber-700" >
          Play
        </Link>
      </div>
    </div>
  );
}
