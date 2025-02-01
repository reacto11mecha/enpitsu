import type { TRPCRouterRecord } from "@trpc/server";

import { cache } from "@enpitsu/cache";
import { asc, eq } from "@enpitsu/db";
import * as schema from "@enpitsu/db/schema";
import { validateId } from "@enpitsu/token-generator";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure } from "../trpc";

export const gradeRouter = {
  getGrades: adminProcedure.query(({ ctx }) => ctx.db.query.grades.findMany()),

  getSubgrades: adminProcedure
    .input(
      z.object({
        gradeId: z.number(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.subGrades.findMany({
        where: eq(schema.subGrades.gradeId, input.gradeId),
        with: {
          grade: true,
        },
        orderBy: [asc(schema.subGrades.label)],
      }),
    ),

  getStudents: adminProcedure
    .input(z.object({ subgradeId: z.number().nullable() }))
    .query(async ({ ctx, input }) => {
      if (!input.subgradeId) return [];

      return await ctx.db.query.students.findMany({
        where: eq(schema.students.subgradeId, input.subgradeId),
        orderBy: [asc(schema.students.name)],
      });
    }),

  getSubgrade: adminProcedure.input(z.number()).query(({ ctx, input }) =>
    ctx.db.query.subGrades.findFirst({
      where: eq(schema.subGrades.id, input),
    }),
  ),

  createGrade: adminProcedure
    .input(z.object({ label: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.grades).values(input);
    }),

  createSubgrade: adminProcedure
    .input(
      z.object({
        gradeId: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.subGrades).values(input);
    }),

  createStudent: adminProcedure
    .input(
      z.object({
        name: z.string(),
        participantNumber: z.string(),
        room: z.string(),
        subgradeId: z.number(),
        token: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.students).values(input);
    }),

  createStudentMany: adminProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          participantNumber: z.string(),
          room: z.string(),
          subgradeId: z.number(),
          token: z.string(),
        }),
      ),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.students).values(input);
    }),

  updateSubgrade: adminProcedure
    .input(
      z.object({
        id: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        try {
          const allStudents = await tx.query.students.findMany({
            where: eq(schema.students.subgradeId, input.id),
            columns: {
              token: true,
            },
          });

          for (const student of allStudents)
            await cache.del(`student-trpc-token-${student.token}`);
        } catch (_) {
          console.error(
            JSON.stringify({
              time: Date.now().valueOf(),
              msg: "Failed to remove cached student data, still continuing operation without cache removal",
              endpoint: "grade.updateSubgrade",
              data: input,
            }),
          );
        }

        return await tx
          .update(schema.subGrades)
          .set({ label: input.label })
          .where(eq(schema.subGrades.id, input.id));
      }),
    ),

  updateStudent: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        participantNumber: z.string(),
        room: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.students)
        .set({
          name: input.name,
          participantNumber: input.participantNumber,
          room: input.room,
        })
        .where(eq(schema.students.id, input.id));
    }),

  deleteGrade: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const subgrades = await tx.query.subGrades.findMany({
          where: eq(schema.subGrades.gradeId, input),
          columns: {
            id: true,
          },
          with: {
            students: {
              columns: {
                token: true,
              },
            },
          },
        });

        await tx.delete(schema.grades).where(eq(schema.grades.id, input));
        await tx
          .delete(schema.subGrades)
          .where(eq(schema.subGrades.gradeId, input));

        await tx.transaction(async (tx2) => {
          for (const subgrade of subgrades) {
            await tx2
              .delete(schema.students)
              .where(eq(schema.students.subgradeId, subgrade.id));
            await tx2
              .delete(schema.allowLists)
              .where(eq(schema.allowLists.subgradeId, subgrade.id));

            try {
              for (const { token } of subgrade.students)
                await cache.del(`student-trpc-token-${token}`);
            } catch (_) {
              console.error(
                JSON.stringify({
                  time: Date.now().valueOf(),
                  msg: "Failed to remove cached student data, still continuing operation without cache removal",
                  endpoint: "grade.deleteGrade",
                  input,
                }),
              );
            }
          }
        });
      });
    }),

  deleteSubgrade: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        await tx.delete(schema.subGrades).where(eq(schema.subGrades.id, input));
        await tx
          .delete(schema.students)
          .where(eq(schema.students.subgradeId, input));
        await tx
          .delete(schema.allowLists)
          .where(eq(schema.allowLists.subgradeId, input));
      }),
    ),

  deleteStudent: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(schema.students)
        .where(eq(schema.students.id, input));
    }),

  uploadSpecificGradeExcel: adminProcedure
    .input(
      z.object({
        gradeId: z.number(),
        data: z.array(
          z.object({
            subgradeName: z.string(),
            data: z.array(
              z.object({
                Nama: z.string().min(2).max(255),
                "Nomor Peserta": z.string().min(5).max(50),
                Ruang: z.string().min(1).max(50),
                Token: z.string().min(6).max(6).refine(validateId),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const subgrades = await tx.query.subGrades.findMany({
          where: eq(schema.subGrades.gradeId, input.gradeId),
          columns: {
            label: true,
            id: true,
          },
        });

        if (subgrades.length < 1)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Belum ada data kelas pada angkatan ini!",
          });

        if (
          !subgrades.every((sg) =>
            input.data.find((d) => sg.label === d.subgradeName),
          )
        )
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ada nama kelas yang tidak ada/sesuai!",
          });

        for (const sg of subgrades) {
          await tx.transaction(async (tx2) => {
            const correspondClass = input.data.find(
              (d) => sg.label === d.subgradeName,
            )!;

            const dataToInsert = correspondClass.data.map((std) => ({
              name: std.Nama,
              token: std.Token,
              room: std.Ruang,
              participantNumber: std["Nomor Peserta"],
              subgradeId: sg.id,
            }));

            await tx2.insert(schema.students).values(dataToInsert);
          });
        }
      }),
    ),

  downloadSpecificGradeExcel: adminProcedure
    .input(z.object({ gradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const gradesData = await ctx.db.query.grades.findFirst({
        where: eq(schema.grades.id, input.gradeId),
        columns: {
          label: true,
        },
        with: {
          subgrades: {
            columns: {
              label: true,
            },
            with: {
              students: {
                columns: {
                  name: true,
                  token: true,
                  participantNumber: true,
                  room: true,
                },
              },
            },
          },
        },
      });

      if (!gradesData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data yang anda cari tidak ditemukan!",
        });

      if (gradesData.subgrades.length < 1)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Belum ada data kelas pada angkatan ini!",
        });

      return gradesData;
    }),

  downloadSpecificSubgradeExcel: adminProcedure
    .input(z.object({ subgradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const subgradeData = await ctx.db.query.subGrades.findFirst({
        where: eq(schema.grades.id, input.subgradeId),
        columns: {
          label: true,
        },
        with: {
          students: {
            columns: {
              name: true,
              token: true,
              participantNumber: true,
              room: true,
            },
          },
          grade: {
            columns: {
              label: true,
            },
          },
        },
      });

      if (!subgradeData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data yang anda cari tidak ditemukan!",
        });

      if (subgradeData.students.length < 1)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Belum ada data peserta pada angkatan ini!",
        });

      return subgradeData;
    }),

  getSubgradesWithGrade: adminProcedure.query(async ({ ctx }) =>
    ctx.db.query.subGrades.findMany({
      columns: {
        id: true,
        label: true,
      },
      with: {
        grade: {
          columns: {
            label: true,
          },
        },
      },
    }),
  ),

  addTemporaryBan: adminProcedure
    .input(
      z.object({
        studentId: z.number().min(1),
        startedAt: z.date(),
        endedAt: z.date(),
        reason: z.string().min(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.insert(schema.studentTemporaryBans).values(input);
      } catch (e) {
        // @ts-expect-error unknown error value
        if (e.code === "23505" && e.constraint_name === "uniq_student_id")
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Sudah ada peserta dalam daftar larangan ini! Jika ingin memperbarui jadwal dan alasan, silahkan edit peserta tersebut.",
          });
        else
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Terjadi kesalahan internal, mohon coba lagi nanti",
          });
      }
    }),

  editTemporaryBan: adminProcedure
    .input(
      z.object({
        id: z.number().min(1),
        startedAt: z.date(),
        endedAt: z.date(),
        reason: z.string().min(5),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        await tx
          .update(schema.studentTemporaryBans)
          .set({
            startedAt: input.startedAt,
            endedAt: input.endedAt,
            reason: input.reason,
          })
          .where(eq(schema.studentTemporaryBans.id, input.id));
      }),
    ),

  deleteSingleTemporaryBan: adminProcedure
    .input(z.object({ id: z.number().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        await tx
          .delete(schema.studentTemporaryBans)
          .where(eq(schema.studentTemporaryBans.id, input.id));
      }),
    ),

  deleteManyTemporaryBan: adminProcedure
    .input(z.object({ ids: z.array(z.number().min(1)) }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        for (const id of input.ids) {
          await tx
            .delete(schema.studentTemporaryBans)
            .where(eq(schema.studentTemporaryBans.id, id));
        }
      }),
    ),
} satisfies TRPCRouterRecord;
