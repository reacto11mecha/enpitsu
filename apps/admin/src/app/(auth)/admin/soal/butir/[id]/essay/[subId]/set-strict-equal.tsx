"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useTRPC } from "~/trpc/react";

export function SetStrictEqual({ essayId }: { essayId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const strictEqualQuery = useQuery(
    trpc.question.getStrictEqualEssay.queryOptions(
      { id: essayId },
      {
        refetchInterval: 5000,
      },
    ),
  );
  const strictEqualMutation = useMutation(
    trpc.question.setStrictEqualEssay.mutationOptions({
      onError(err) {
        toast.error("Gagal memperbarui jawaban benar", {
          description: err.message,
        });
      },
      async onSettled() {
        await queryClient.invalidateQueries(
          trpc.question.getStrictEqualEssay.pathFilter(),
        );
      },
    }),
  );

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="strict-equal"
        checked={strictEqualQuery.data?.isStrictEqual}
        disabled={!strictEqualQuery.isSuccess || strictEqualMutation.isPending}
        onCheckedChange={(val) =>
          strictEqualMutation.mutate({ id: essayId, strictEqual: val })
        }
      />
      <Label htmlFor="strict-equal">Jawaban wajib persis sama?</Label>
    </div>
  );
}
