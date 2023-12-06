import { IBM_Plex_Mono, Zen_Maru_Gothic } from "next/font/google";

const zen = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: "500",
});

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
});

export default function AboutPage() {
  return (
    <main className="px-5 py-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Tentang Aplikasi Ini
      </h1>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Aplikasi adalah ujian untuk melakukan ujian secara online yang berbasis
        web dan mobile apps. Aplikasi ini memiliki nama dalam Bahasa Jepang
        yaitu <span className={ibm.className}>enpitsu</span> (
        <span className={zen.className}>鉛筆</span> |{" "}
        <span className={zen.className}>えんぴつ</span>) yang memiliki arti
        pensil, mengapa? Karena pensil adalah ATK yang digunakan untuk mengisi
        LJK (Lembar Jawaban Komputer) ketika ulangan tulis. Dengan keberadaan
        software ini, di harapkan bisa memenuhi kebutuhan sekolah dalam
        melakukan asesmen peserta didik.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Author
      </h2>

      <div className="mt-8 flex flex-col gap-3">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Ezra Khairan Permana
        </h3>
        <a
          href="https://rmecha.my.id/"
          target="_blank"
          rel="noreferrer noopener"
          className="scroll-m-20 text-xl font-semibold tracking-tight text-sky-600 hover:text-sky-800"
        >
          https://rmecha.my.id/
        </a>
      </div>
    </main>
  );
}
