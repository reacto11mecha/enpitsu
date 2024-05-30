import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import enpitsuLogo from "@/icon.png";
import { studentTokenAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import { UAParser } from "ua-parser-js";

import App from "./App";

import "@fontsource/space-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

const SetToken = lazy(() => import("@/components/set-token"));

const parser = new UAParser();

const browser = parser.getBrowser();
const userOS = parser.getOS();

const enforceChromeOnAndroidOnly =
  browser.name === "Samsung Internet" ||
  browser.name === "MIUI Browser" ||
  (userOS.name === "Android" && browser.name !== "Chrome");
const enforceLatestVersion =
  userOS.name === "Android" &&
  (browser.major ? parseInt(browser.major) < 90 : true);

export default function Provider() {
  const [studentAtom] = useAtom(studentTokenAtom);

  if (enforceChromeOnAndroidOnly)
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
          <div className="flex flex-col items-center">
            <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight text-orange-600 first:mt-0 dark:text-orange-500">
              Perhatian
            </h2>
            <h3 className="scroll-m-20 text-center text-2xl tracking-tight">
              Anda wajib menggunakan Google Chrome
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="md:w-[80%] lg:w-[50%]">
              <p className="text-justify leading-7 [&:not(:first-child)]:mt-6">
                Supaya web ini berjalan tanpa kendala, anda wajib menggunakan
                Google Chrome versi terbaru untuk mengerjakan soal ulangan.
                Salin link website ini, unduh Google Chrome menyesuaikan dengan
                sistem operasi anda.
              </p>

              <div className="mt-5">
                <p>Link unduhan:</p>
                <ul className="ml-6 list-disc [&>li]:mt-2">
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://play.google.com/store/apps/details?id=com.android.chrome"
                    >
                      Google Play Store (Android)
                    </a>
                  </li>
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://itunes.apple.com/us/app/apple-store/id535886823?pt%3D9008%26ct%3Dhelp-center-mg%26mt%3D8"
                    >
                      App Store (iOS)
                    </a>
                  </li>
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.google.com/chrome/"
                    >
                      Desktop (Windows, Mac, Linux)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );

  if (enforceLatestVersion)
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
          <div className="flex flex-col items-center">
            <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight text-orange-600 first:mt-0 dark:text-orange-500">
              Perhatian
            </h2>
            <h3 className="scroll-m-20 text-center text-2xl tracking-tight">
              Anda memang menggunakan Google Chrome, tetapi...
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="md:w-[80%] lg:w-[50%]">
              <p className="text-justify leading-7 [&:not(:first-child)]:mt-6">
                Tetapi anda wajib memperbarui versi chrome anda saat ini ke
                versi terbaru. Update browser anda sesuai toko aplikasi sistem
                operasi anda.
              </p>

              <div className="mt-5">
                <p>Link unduhan:</p>
                <ul className="ml-6 list-disc [&>li]:mt-2">
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://play.google.com/store/apps/details?id=com.android.chrome"
                    >
                      Google Play Store (Android)
                    </a>
                  </li>
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://itunes.apple.com/us/app/apple-store/id535886823?pt%3D9008%26ct%3Dhelp-center-mg%26mt%3D8"
                    >
                      App Store (iOS)
                    </a>
                  </li>
                  <li>
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.google.com/chrome/"
                    >
                      Desktop (Windows, Mac, Linux)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {studentAtom === "" ? (
        <Suspense
          fallback={
            <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
              <img src={enpitsuLogo} className="w-28 rounded-lg" />
              <RefreshCw size={35} className="animate-spin" />
            </div>
          }
        >
          <SetToken init />
        </Suspense>
      ) : (
        <App />
      )}
      <Toaster />
    </ThemeProvider>
  );
}
