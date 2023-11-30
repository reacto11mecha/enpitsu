import { Zen_Maru_Gothic, IBM_Plex_Mono } from "next/font/google"

const zen = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: "500"
})

const ibm = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: "500"
})

export default function HomePage() {
  return (
    <>
      <h1 className={`${zen.className} text-5xl text-gray-700`}>鉛筆</h1>
      <h2 className={`${zen.className} text-5xl text-gray-700`}>えんぴつ</h2>
      <h3 className={`${ibm.className} text-5xl text-gray-700`}>enpitsu</h3>
    </>
  );
}
