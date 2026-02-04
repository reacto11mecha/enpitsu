"use client";

import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format, startOfDay } from "date-fns";
import { Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { TAddBannedStudentSchema } from "@enpitsu/validator/exam";
import { AddBannedStudentSchema } from "@enpitsu/validator/exam";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/react";

export function AddBannedStudent() {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addNewBannedStudent = useMutation(
    trpc.grade.addTemporaryBans.mutationOptions({
      async onSuccess() {
        form.reset();

        await queryClient.invalidateQueries(
          trpc.question.getStudentNotInTemporaryBan.pathFilter(),
        );
        await queryClient.invalidateQueries(
          trpc.question.getStudentTempobans.pathFilter(),
        );

        toast.success("Penambahan Larangan Berhasil!", {
          description: `Berhasil menambahkan peserta!`,
        });

        setDialogOpen(false);
      },

      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  const studentListsQuery = useQuery(
    trpc.grade.getStudentNotInTemporaryBan.queryOptions(),
  );

  const form = useForm<TAddBannedStudentSchema>({
    resolver: zodResolver(AddBannedStudentSchema),
    defaultValues: {
      studentIds: [],
      reason: "",
    },
  });

  const studentIdsField = form.watch("studentIds");

  const studentList = useMemo(() => {
    if (studentListsQuery.data) {
      const baseData = studentListsQuery.data.filter(
        (d) => !studentIdsField.find((ids) => ids === d.id),
      );

      if (debouncedSearchKeyword !== "")
        return baseData.filter((d) =>
          d.name.toLowerCase().includes(debouncedSearchKeyword.toLowerCase()),
        );
      return baseData;
    }

    return [];
  }, [studentListsQuery, studentIdsField, debouncedSearchKeyword]);

  const searchCount = useMemo(() => studentList.length, [studentList]);

  const getStudentName = (id: number) => {
    return studentListsQuery.data?.find((s) => s.id === id)?.name ?? "Unknown";
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        if (addNewBannedStudent.isPending) return;

        form.reset();

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button>Tambah peserta</Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader className="px-1">
          <DialogTitle>Tambahkan Larangan Untuk peserta</DialogTitle>
          <DialogDescription>
            Pilih peserta dari daftar yang sudah dibuat. Pilih peserta dari
            spesifik kelas, tentukan durasi, dan berikan alasan yang jelas.
            Masing-masing peserta hanya mendapatkan satu kesempatan larangan.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((val) =>
                addNewBannedStudent.mutate(val),
              )}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="studentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peserta Terpilih</FormLabel>

                    <div className="flex min-h-[30px] flex-wrap gap-2">
                      {field.value.length === 0 && (
                        <span className="text-muted-foreground text-sm italic">
                          Belum ada peserta dipilih
                        </span>
                      )}
                      {field.value.map((studentId) => (
                        <Badge
                          key={studentId}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          <span
                            className="max-w-[150px] truncate"
                            title={getStudentName(studentId)}
                          >
                            {getStudentName(studentId)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = field.value.filter(
                                (id) => id !== studentId,
                              );
                              field.onChange(newValue);
                            }}
                            className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <FormControl>
                      <div className="space-y-2">
                        <InputGroup className="w-full">
                          <InputGroupInput
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Cari peserta..."
                          />
                          <InputGroupAddon>
                            <Search />
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            {searchCount} hasil
                          </InputGroupAddon>
                        </InputGroup>

                        <StudentSearchList
                          data={studentList}
                          onSelect={(id) => {
                            field.onChange([...field.value, id]);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Cari dan klik nama peserta untuk menambahkannya ke daftar
                      larangan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
                <FormField
                  control={form.control}
                  name="startedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Mulai</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          type="datetime-local"
                          min={format(
                            startOfDay(new Date()),
                            "yyyy-MM-dd'T'HH:mm",
                          )}
                          value={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={addNewBannedStudent.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu awal peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Selesai</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            form.getValues("startedAt")
                              ? format(
                                  form.getValues("startedAt"),
                                  "yyyy-MM-dd'T'HH:mm",
                                )
                              : ""
                          }
                          value={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={addNewBannedStudent.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu akhir peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Masukan alasan logis"
                        disabled={addNewBannedStudent.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan alasan yang akan diterima oleh peserta tersebut.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={addNewBannedStudent.isPending}>
                Tambah
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
interface StudentSearchListProps {
  data: { id: number; name: string }[];
  onSelect?: (studentId: number) => void;
}

function StudentSearchList({ data, onSelect }: StudentSearchListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45, // Text + Margin + Separator
    overscan: 5,
  });

  return (
    <ScrollArea className="h-32 rounded-md border" viewportRef={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const student = data[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-3"
              onClick={() => onSelect?.(student!.id)}
            >
              <div className="cursor-pointer py-2">
                <div className="text-sm">{student!.name}</div>
              </div>
              <Separator />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
