"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsRight, Trash2 } from "lucide-react";

import { api } from "~/utils/api";

export const AngkatanViewer = () => {
  const grades = api.grade.getGrades.useQuery();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {grades.isLoading && !grades.isError ? (
        <>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </>
      ) : null}

      {!grades.isLoading &&
        grades.data?.map((grade) => (
          <Card key={grade.id}>
            <CardHeader />
            <CardContent>
              <h3 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
                {grade.label}
              </h3>
            </CardContent>
            <CardFooter className="mt-5 flex justify-center gap-3">
              <Button asChild>
                <Link href={`/admin/angkatan/${grade.id}`}>
                  <ChevronsRight />
                </Link>
              </Button>
              <Button variant="destructive">
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
};
