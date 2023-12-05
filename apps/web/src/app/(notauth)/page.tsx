import { IBM_Plex_Mono, Zen_Maru_Gothic } from "next/font/google";

const zen = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: "500",
});

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
});

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-24 bg-gray-100">
      <h1 className={`${zen.className} text-5xl text-gray-700`}>鉛筆</h1>
      <h2 className={`${zen.className} text-5xl text-gray-700`}>えんぴつ</h2>
      <h3 className={`${ibm.className} text-5xl text-gray-700`}>enpitsu</h3>
    </main>
  );
}
