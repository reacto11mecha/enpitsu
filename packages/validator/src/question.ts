import { z } from "zod";

const slug = z.string().min(4, { message: "Minimal memiliki 4 karakter!" });
const parentQuestionBaseSchema = z.object({
  title: z.string().min(5, { message: "Minimal memiliki 5 karakter!" }),
  slug,
  startedAt: z.date({
    required_error: "Diperlukan kapan waktu ujian dimulai!",
  }),
  endedAt: z.date({
    required_error: "Diperlukan kapan waktu ujian selesai!",
  }),
  allowLists: z.array(z.number()).min(1, {
    message: "Minimal terdapat satu kelas yang bisa mengerjakan soal!",
  }),
  shuffleQuestion: z.boolean(),
});

export const NewParentQuestionSchema = parentQuestionBaseSchema
  .extend({
    multipleChoiceOptions: z.coerce
      .number()
      .min(0, {
        message: "Pilihlah salah satu banyak opsi jawaban pilihan ganda!",
      })
      .min(4)
      .max(5),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export type TNewParentQuestionSchema = z.infer<typeof NewParentQuestionSchema>;

export const EditParentQuestionSchema = parentQuestionBaseSchema
  .extend({
    id: z.number(),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export type TEditParentQuestionSchema = z.infer<
  typeof EditParentQuestionSchema
>;

// TRPC Server Side Schema
export const UniversalQuestionIdSchema = z.object({
  questionId: z.number(),
});

export const UniversalIdSchema = z.object({ id: z.number() });

export const CreateQuestionSchema = z.object({
  slug,
  title: z.string().min(5),
  multipleChoiceOptions: z.number().min(4).max(5),
  startedAt: z.date(),
  endedAt: z.date(),
  allowLists: z.array(z.number()).min(1),
  shuffleQuestion: z.boolean(),
});

export const DuplicateQuestionSchema = UniversalIdSchema.extend({
  slug,
});

export type TDuplicateQuestionSchema = z.infer<typeof DuplicateQuestionSchema>;

export const BunchOfIdsSchema = z.object({ ids: z.array(z.number()) });

export const CorrectAnswerChoiceSchema = z.object({
  id: z.number(),
  correctAnswer: z.number(),
});

export const StrictEquanEssaySchema = z.object({
  id: z.number(),
  strictEqual: z.boolean(),
});

export const UniversalRespondIdSchema = z.object({ respondId: z.number() });

export const UpdateEssayScoreSchema = z.object({
  score: z.number().min(0).max(1),
  id: z.number(),
});
