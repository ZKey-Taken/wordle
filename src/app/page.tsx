"use client";
import Link from "next/link";
import Image from "next/image";
import { pickDifficulty } from "./utils";

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
