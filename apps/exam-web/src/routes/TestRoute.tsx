import { ActualTest } from "@/components/TestRouter/ActualTest";
import { Button } from "@/components/ui/button";
import enpitsuLogo from "@/icon.png";
import { studentAnswerAtom } from "@/lib/atom";
import { api } from "@/utils/api";
import { useAtomValue } from "jotai";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function TestRoute() {
  const initialAnswer = useAtomValue(studentAnswerAtom);

  const { slug } = useParams<{ slug: string }>();

  const questionQuery = api.exam.queryQuestion.useQuery(
    {
      slug: slug ?? "",
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  if (questionQuery.isError)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 p-5">
        <h2 className="font-monospace scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
          Terjadi Kesalahan
        </h2>

        <p className="text-center text-lg">{questionQuery.error.message}</p>

        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft />
            <span className="sr-only">Kembali ke halaman depan</span>
          </Link>
        </Button>
      </div>
    );

  if (questionQuery.isPending)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
        <img src={enpitsuLogo} className="w-28 rounded-lg" />
        <RefreshCw size={35} className="animate-spin" />
      </div>
    );

  return <ActualTest data={questionQuery.data} initialData={initialAnswer} />;
}
