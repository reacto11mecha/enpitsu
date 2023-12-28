import { ActualTest } from "@/components/TestRouter/ActualTest";
import { api } from "@/utils/api";
import { RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";

export default function TestRoute() {
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
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
        <h2 className="font-monospace scroll-m-20 pb-2 text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
          Terjadi Kesalahan
        </h2>
        <p className="text-lg">{questionQuery.error.message}</p>
      </div>
    );

  if (questionQuery.isLoading)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <RefreshCw size={35} className="animate-spin" />
      </div>
    );

  return <ActualTest data={questionQuery.data} />;
}
