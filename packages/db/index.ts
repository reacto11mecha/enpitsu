import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as auth from "./schema/auth";
import * as grade from "./schema/grade";
import * as question from "./schema/question";

export const schema = { ...auth, ...grade, ...question };

export { myPgTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

export const db = drizzle(postgres(process.env.DATABASE_URL!), {
  schema,
});

// Prepared statement stuff
export const preparedStudentIsCheated = db.query.studentBlocklists
  .findFirst({
    where: and(
      eq(schema.studentBlocklists.studentId, sql.placeholder("studentId")),
      eq(schema.studentBlocklists.questionId, sql.placeholder("questionId")),
    ),
    columns: {
      time: true,
    },
  })
  .prepare("studentCheated");

export const preparedStudentHasAnswered = db.query.studentResponds
  .findFirst({
    columns: {
      submittedAt: true,
    },
    where: and(
      eq(schema.studentResponds.studentId, sql.placeholder("studentId")),
      eq(schema.studentResponds.questionId, sql.placeholder("questionId")),
    ),
  })
  .prepare("studentHasAnswered");

export const preparedQuestionSelect = db.query.questions
  .findFirst({
    where: eq(schema.questions.slug, sql.placeholder("slug")),
    columns: {
      id: true,
      title: true,
      slug: true,
      startedAt: true,
      endedAt: true,
    },
    with: {
      allowLists: {
        columns: {
          subgradeId: true,
        },
      },
      multipleChoices: {
        orderBy: (choice, { asc }) => [asc(choice.iqid)],
        columns: {
          iqid: true,
          question: true,
          options: true,
        },
      },
      essays: {
        orderBy: (essay, { asc }) => [asc(essay.iqid)],
        columns: {
          iqid: true,
          question: true,
        },
      },
    },
  })
  .prepare("unversalQuestionSelect");

export const preparedGetStudent = db.query.students
  .findFirst({
    where: eq(schema.students.token, sql.placeholder("token")),
    columns: {
      id: true,
      name: true,
      participantNumber: true,
      room: true,
      token: true,
    },
    with: {
      subgrade: {
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
      },
    },
  })
  .prepare("getStudentDatas");
