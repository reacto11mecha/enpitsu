import { z } from "zod";

export const NewGradeOrSubgradeSchema = z.object({
  label: z.string().min(1, {
    message: "Nama kelas wajib di isi!",
  }),
});

export type TNewGradeOrSubgradeSchema = z.infer<
  typeof NewGradeOrSubgradeSchema
>;

export interface TokenConstructorInterface {
  validator: (id: string) => boolean;
  minimalTokenLength: number;
  maximalTokenLength: number;
}

// This is the new magic type
export type TokenValidationParams =
  // Scenario 1: Client side (isServer is false or undefined) -> Everything required
  | (TokenConstructorInterface & { isServer?: false })
  // Scenario 2: Server side (isServer is true) -> Interface is Partial (optional)
  | (Partial<TokenConstructorInterface> & { isServer: true });

const studentName = z
  .string()
  .min(2, { message: "Nama wajib di isi!" })
  .max(255, { message: "Nama terlalu panjang!" });
const studentParticipantNumber = z
  .string()
  .min(5, { message: "Nomor peserta wajib di isi!" })
  .max(50, { message: "Panjang maksimal hanya 50 karakter!" });
const studentRoom = z
  .string()
  .min(1, { message: "Ruangan peserta wajib di isi!" })
  .max(50, { message: "Panjang maksimal hanya 50 karakter!" });
const studentToken = (params: TokenValidationParams) => {
  if (params.isServer) {
    return z.string().min(1, {
      message: "Token wajib di isi!",
    });
  } else {
    return z
      .string()
      .min(1, {
        message: "Token wajib di isi!",
      })
      .min(params.minimalTokenLength, {
        message: `Panjang token minimal ${params.minimalTokenLength} karakter!`,
      })
      .max(params.maximalTokenLength, {
        message: `Panjang token tidak boleh dari ${params.maximalTokenLength} karakter!`,
      })
      .refine(params.validator, { message: "Format token tidak sesuai!" });
  }
};

const CommonDataSchema = (params: TokenValidationParams) =>
  z.array(
    z.object({
      Nama: studentName,
      "Nomor Peserta": studentParticipantNumber,
      Ruang: studentRoom,
      Token: studentToken(params),
    }),
  );

export type TCommonDataSchema = z.infer<ReturnType<typeof CommonDataSchema>>;

export const UploadStudentXLSXSchemaConstructor = (
  params: TokenValidationParams,
) =>
  z.array(
    z.object({
      subgradeName: z.string(),
      data: CommonDataSchema(params),
    }),
  );

export const UploadCSVConstructor = CommonDataSchema;

export const UpdateStudentSchema = z.object({
  name: studentName,
  participantNumber: studentParticipantNumber,
  room: studentRoom,
});

export type TUpdateStudentSchema = z.infer<typeof UpdateStudentSchema>;

export const AddStudentConstructor = (params: TokenValidationParams) =>
  UpdateStudentSchema.extend({
    token: studentToken(params),
  });

export type TAddStudentSchema = z.infer<
  ReturnType<typeof AddStudentConstructor>
>;

export const FirstStepFullCSVConstructor = (
  params: TokenConstructorInterface,
) =>
  z.array(
    z.object({
      Nama: studentName,
      "Nomor Peserta": studentParticipantNumber,
      Ruang: studentRoom,
      Kelas: z.string(),
      Token: studentToken(params),
    }),
  );

export const CompleteCSVUploadSchema = z.array(
  z.object({
    grade: z.string().min(1),
    subgrade: z.array(
      z.object({
        label: z.string().min(1),
        participants: z.array(
          z.object({
            Nama: studentName,
            "Nomor Peserta": studentParticipantNumber,
            Ruang: studentRoom,
            Token: studentToken({ isServer: true }),
          }),
        ),
      }),
    ),
  }),
);
export type TCompleteCSVUploadSchema = z.infer<typeof CompleteCSVUploadSchema>;

const universalId = z.number();

export const UniversalIdSchema = z.object({
  id: universalId,
});

export const UniversalGradeIdSchema = z.object({
  gradeId: universalId,
});

export const UniversalSubgradeIdSchema = z.object({
  subgradeId: universalId,
});

export const GetStudentSchema = z.object({
  subgradeId: universalId.nullable(),
});

export const CreateSubgradeSchema = NewGradeOrSubgradeSchema.extend({
  gradeId: universalId,
});

export const JustNumberSchema = z.number();

export const StudentRelatedConstructor = () => ({
  CreateStudentSchema: AddStudentConstructor({ isServer: true }).extend({
    subgradeId: universalId,
  }),
  CreateStudentMany: z.array(
    AddStudentConstructor({ isServer: true }).extend({
      subgradeId: universalId,
    }),
  ),
  UpdateStudentServerSchema: UpdateStudentSchema.extend({
    id: universalId,
  }),
});

export const UploadSpecificGradeExcel = z.object({
  gradeId: universalId,
  data: UploadStudentXLSXSchemaConstructor({ isServer: true }),
});

const baseTemporaryBan = z.object({
  startedAt: z.date(),
  endedAt: z.date(),
  reason: z.string().min(5),
});

export const TemporaryBanSchema = baseTemporaryBan.extend({
  studentId: z.number().min(1),
});

export const MultiTemporaryBan = baseTemporaryBan.extend({
  studentIds: z.array(z.number()).min(1),
});
