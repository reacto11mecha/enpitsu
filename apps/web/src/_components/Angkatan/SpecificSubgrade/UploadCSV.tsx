"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileSpreadsheet } from "lucide-react";

import { api } from "~/utils/api";

export const UploadCSV = ({
  grade,
  subgrade,
}: {
  grade: {
    id: number;
    label: string;
  };
  subgrade: {
    id: number;
    label: string;
    gradeId: number;
  };
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Upload CSV <FileSpreadsheet className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload File CSV</DialogTitle>
          <DialogDescription>
            Upload file csv untuk menambah murid baru di kelas{" "}
            <b>
              {grade.label} {subgrade.label}
            </b>
            . Nama akan otomatis tersortir dari A ke Z.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit">Tambah</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
