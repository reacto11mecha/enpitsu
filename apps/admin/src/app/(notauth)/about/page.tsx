import { IBM_Plex_Mono, Zen_Maru_Gothic } from "next/font/google";
import Image from "next/image";

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
        <div className="flex flex-col items-center gap-20 md:flex-row md:justify-around md:gap-0">
          <div className="flex gap-5">
            <Image
              src="https://avatars.githubusercontent.com/u/48118327"
              width={90}
              height={90}
              alt="Foto profil github Ezra Khairan Permana"
              className="rounded-full"
            />

            <div className="flex flex-col justify-center">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Ezra Khairan Permana
              </h3>
              <p>Pembuat utama</p>
              <a
                href="https://rmecha.my.id/"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 scroll-m-20 text-xl font-semibold tracking-tight text-sky-600 hover:text-sky-800"
              >
                https://rmecha.my.id/
              </a>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex flex-col items-end justify-center">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Hendra Manudinata
              </h3>
              <p>Maintainer Infrastruktur</p>
              <a
                href="https://manoedinata.me/"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 scroll-m-20 text-xl font-semibold tracking-tight text-sky-600 hover:text-sky-800"
              >
                https://manoedinata.me/
              </a>
            </div>

            <Image
              src="https://avatars.githubusercontent.com/u/116422610"
              width={90}
              height={90}
              alt="Foto profil github Hendra Manudinata"
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
