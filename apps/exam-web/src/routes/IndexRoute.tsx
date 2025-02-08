import { useCallback, useEffect, useState } from "react";
import { Logout } from "@/components/IndexRouter/Logout";
import { ScanOrInputQuestionSlug } from "@/components/IndexRouter/ScanOrInputQuestionSlug";
import { ModeToggle } from "@/components/mode-toggle";
import { api } from "@/utils/api";
import { Button } from "@enpitsu/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@enpitsu/ui/card";
import { Separator } from "@enpitsu/ui/separator";
import { Skeleton } from "@enpitsu/ui/skeleton";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function IndexRoute() {
  const [isCorrect, setCorrect] = useState(false);

  const closeQuestionScan = useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery();

  useEffect(() => {
    if (studentQuery.error)
      toast.error("Gagal mengambil data pribadi", {
        duration: 9500,
        description: `Operasi mengambil data gagal, mohon coba lagi. Error: ${
          studentQuery.error.message === "Failed to fetch"
            ? "Gagal meraih server"
            : studentQuery.error.message
        }`,
      });
  }, [studentQuery]);

  if (!studentQuery.isError && isCorrect)
    return <ScanOrInputQuestionSlug closeScanner={closeQuestionScan} />;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-5 sm:px-0">
      <Card className="sm:w-[450px]">
        <CardHeader>
          <CardTitle>Sebelum Mengerjakan,</CardTitle>
          <CardDescription>
            Pastikan identitas anda sudah benar dan sesuai dengan yang tertera
            pada kartu ujian.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <table className="w-full">
            {studentQuery.isError ? (
              <tbody className="w-full">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={3}>
                      <Skeleton
                        className={`h-5 w-full animate-none bg-red-500 dark:bg-red-800 ${
                          idx > 0 ? "mt-2" : ""
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody className="w-full">
                {!studentQuery.isPending ? (
                  <tr className="w-full">
                    <td>No Peserta</td>
                    <td className="px-1">:</td>
                    <td>{studentQuery.data.student.participantNumber}</td>
                  </tr>
                ) : (
                  <tr className="w-full">
                    <td colSpan={3}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                )}

                {!studentQuery.isPending ? (
                  <tr className="w-full">
                    <td>Nama</td>
                    <td className="px-1">:</td>
                    <td>{studentQuery.data.student.name}</td>
                  </tr>
                ) : (
                  <tr className="w-full">
                    <td colSpan={3}>
                      <Skeleton className="mt-2 h-5 w-full" />
                    </td>
                  </tr>
                )}

                {!studentQuery.isPending ? (
                  <tr className="w-full">
                    <td>Kelas</td>
                    <td className="px-1">:</td>
                    <td>
                      {studentQuery.data.student.subgrade.grade.label}{" "}
                      {studentQuery.data.student.subgrade.label}
                    </td>
                  </tr>
                ) : (
                  <tr className="w-full">
                    <td colSpan={3}>
                      <Skeleton className="mt-2 h-5 w-full" />
                    </td>
                  </tr>
                )}

                {!studentQuery.isPending ? (
                  <tr className="w-full">
                    <td>Ruangan</td>
                    <td className="px-1">:</td>
                    <td>{studentQuery.data.student.room}</td>
                  </tr>
                ) : (
                  <tr className="w-full">
                    <td colSpan={3}>
                      <Skeleton className="mt-2 h-5 w-full" />
                    </td>
                  </tr>
                )}

                {!studentQuery.isPending ? (
                  <tr className="w-full">
                    <td>Token</td>
                    <td className="px-1">:</td>
                    <td className="font-space">
                      {studentQuery.data.student.token}
                    </td>
                  </tr>
                ) : (
                  <tr className="w-full">
                    <td colSpan={3}>
                      <Skeleton className="mt-2 h-5 w-full" />
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </CardContent>

        <Separator />

        <CardFooter className="flex gap-2 pt-6">
          <Button asChild variant="outline">
            <Link to="/settings">
              <Settings />
            </Link>
          </Button>
          <Button
            className="w-full"
            disabled={!studentQuery.data || studentQuery.isError}
            onClick={() => setCorrect(true)}
          >
            Ya, sudah benar
          </Button>
          <ModeToggle size="default" />
        </CardFooter>
      </Card>

      <Logout />
    </div>
  );
}
