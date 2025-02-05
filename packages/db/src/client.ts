import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./_main";

export const db = drizzle(postgres(process.env.DATABASE_URL!), {
  schema,
  casing: "snake_case",
});

// Prepared statement stuff
export const preparedStudentIsTemporarilyBanned = db.query.studentTemporaryBans
  .findFirst({
    where: eq(
      schema.studentTemporaryBans.studentId,
      sql.placeholder("studentId"),
    ),
    columns: {
      startedAt: true,
      endedAt: true,
      reason: true,
    },
  })
  .prepare("studentTemporarilyBanned");

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

// Prepared statement for download all answers
export const studentRespondsData = db.query.studentResponds
  .findMany()
  .prepare("studentRespondsBasicData");

// Prepared statement for download specific question answer
export const specificQuestionData = db.query.questions
  .findFirst({
    where: eq(schema.questions.id, sql.placeholder("questionId")),
    columns: {
      title: true,
      slug: true,
    },
    with: {
      multipleChoices: {
        columns: {
          iqid: true,
          correctAnswerOrder: true,
        },
      },
      essays: {
        columns: {
          iqid: true,
        },
      },
    },
  })
  .prepare("specificQuestionData");

export const studentRespondsByQuestionData = db.query.studentResponds
  .findMany({
    where: eq(schema.studentResponds.questionId, sql.placeholder("questionId")),
  })
  .prepare("studentRespondsSpecificQuestionData");
