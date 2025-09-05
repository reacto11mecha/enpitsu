"use client";

import { Loader2, PlusCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "~/components/ui/button";

export function NewQuestionButton() {
  const status = useFormStatus();

  return (
    <Button
      variant="outline"
      type="submit"
      className="h-full w-full p-5"
      disabled={status.pending}
    >
      {status.pending ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <PlusCircle className="h-6 w-6" />
      )}
    </Button>
  );
}

export function NewQuestionButtonInsideEditing() {
  const status = useFormStatus();

  return (
    <Button type="submit" disabled={status.pending}>
      {status.pending ? <Loader2 className="h-6 w-6 animate-spin" /> : null}
      Tambah Nomor Baru
    </Button>
  );
}
