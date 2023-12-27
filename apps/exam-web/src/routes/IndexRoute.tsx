import { useCallback, useState } from "react";
import { ScanOrInputQuestionSlug } from "@/components/IndexRouter/ScanOrInputQuestionSlug";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/utils/api";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function IndexRoute() {
  const { toast } = useToast();

  const [isCorrect, setCorrect] = useState(false);

  const closeQuestionScan = useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      toast({
        variant: "destructive",
        title: "Gagal mengambil data pribadi",
        description: `Operasi mengambil data gagal, coba lagi nanti. Error: ${error.message}`,
      });
    },
  });

  if (isCorrect)
    return <ScanOrInputQuestionSlug closeScanner={closeQuestionScan} />;

  return (
    <div className="flex h-screen w-screen items-center justify-center px-5 sm:px-0">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Sebelum Mengerjakan,</CardTitle>
          <CardDescription>
            Pastikan sudah benar dan sesuai sebelum mengerjakan.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <table className="w-full">
            {!studentQuery.isLoading &&
            studentQuery.data &&
            studentQuery.data.student ? (
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

            {!studentQuery.isLoading &&
            studentQuery.data &&
            studentQuery.data.student ? (
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

            {!studentQuery.isLoading &&
            studentQuery.data &&
            studentQuery.data.student ? (
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

            {!studentQuery.isLoading &&
            studentQuery.data &&
            studentQuery.data.student ? (
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

            {!studentQuery.isLoading &&
            studentQuery.data &&
            studentQuery.data.student ? (
              <tr className="w-full">
                <td>Token</td>
                <td className="px-1">:</td>
                <td>{studentQuery.data.student.token}</td>
              </tr>
            ) : (
              <tr className="w-full">
                <td colSpan={3}>
                  <Skeleton className="mt-2 h-5 w-full" />
                </td>
              </tr>
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
            disabled={studentQuery.isLoading && !studentQuery.data}
            onClick={() => setCorrect(true)}
          >
            Ya, sudah benar
          </Button>
          <ModeToggle size="default" />
        </CardFooter>
      </Card>
    </div>
  );
}
