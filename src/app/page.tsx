import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen text-center justify-center font-[family-name:var(--font-geist-sans)]">
      <p className="pb-10 text-5xl font-bold text-sky-300">
        Ziqi&apos;s Wordle
      </p>
      <div className="flex justify-center text-3xl">
        <Link href={"/play"} className="flex px-5 py-2 rounded-2xl bg-amber-700" >
          Play
        </Link>
      </div>
    </div>
  );
}
