import { z } from "zod";

export const UpdateEssayScoreSchema = z.object({
  score: z.coerce
    .number({
      invalid_type_error: "Hanya bisa di isikan nilai angka!",
      required_error: "Skor dibutuhkan!",
    })
    .min(0, { message: "Skor minimum di angka 0!" })
    .max(1, { message: "Skor maximum di angka 1!" }),
});

export type TUpdateEssayScoreSchema = z.infer<typeof UpdateEssayScoreSchema>;

export const AddBannedStudentSchema = z
  .object({
    studentIds: z
      .array(z.number())
      .min(1, { message: "Pilih nama salah satu peserta!" }),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
    reason: z
      .string()
      .min(3, { message: "Minimal alasan memiliki 3 karakter!" }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export type TAddBannedStudentSchema = z.infer<typeof AddBannedStudentSchema>;

export const EditBannedStudentSchema = z
  .object({
    studentName: z.string(),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
    reason: z
      .string()
      .min(3, { message: "Minimal alasan memiliki 3 karakter!" }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export type TEditBannedStudentSchema = z.infer<typeof EditBannedStudentSchema>;

// TRPC Server Side Schema
export const questionBySlugSchema = z.object({ slug: z.string().min(2) });

export const submitAnswerSchema = z.object({
  questionId: z.number(),
  checkIn: z.date(),
  multipleChoices: z.array(
    z.object({
      iqid: z.number(),
      choosedAnswer: z.number().min(1),
    }),
  ),

  essays: z.array(
    z.object({
      iqid: z.number(),
      answer: z.string(),
    }),
  ),
});

export const studentBlocklistSchema = z.object({
  questionId: z.number(),
  time: z.date(),
});
