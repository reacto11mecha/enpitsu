"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { EssayQuestion } from "./EssayQuestion";
import { MultipleChoice } from "./MultipleChoice";

const formSchema = z.object({
  multipleChoice: z
    .array(
      z.object({
        question: z.string().min(1, { message: "Pertanyaan wajib di isi!" }),
        options: z
          .array(
            z.object({
              order: z.number().min(1).max(5),
              answer: z
                .string()
                .min(1, { message: "Opsi jawaban wajib di isi!" }),
            }),
          )
          .min(5)
          .max(5),

        // correct answer by options order
        correctAnswer: z.number(),
      }),
    )
    .min(1),

  essay: z
    .array(
      z.object({
        question: z.string().min(1, { message: "Pertanyaan wajib di isi!" }),
        answer: z.string().min(1, { message: "Jawaban harus di isi!" }),
      }),
    )
    .min(1),
});

interface Props {
  question: {
    id: number;
    slug: string;
    title: string;
    startedAt: Date;
    endedAt: Date;
    authorId: string;
  };
}

export const Questions = ({ question }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      multipleChoice: [],
      essay: [],
    },
  });

  const mutlipleChoiceField = useFieldArray({
    control: form.control,
    name: "multipleChoice",
  });

  const essayField = useFieldArray({
    control: form.control,
    name: "essay",
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Pilihan Ganda
        </h3>

        <div className="flex flex-col gap-5">
          {mutlipleChoiceField.fields.map((field, index) => (
            <MultipleChoice
              key={field.id}
              index={index}
              title={question.title}
              currentField={mutlipleChoiceField}
            />
          ))}

          <Button
            variant="outline"
            className="h-full w-full p-5"
            onClick={() =>
              mutlipleChoiceField.append({
                question: "",
                options: Array.from({ length: 5 }).map((_, idx) => ({
                  order: idx + 1,
                  answer: "",
                })),
                correctAnswer: 0,
              })
            }
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Esai
        </h3>

        <div className="flex flex-col gap-5">
          {essayField.fields.map((field) => (
            <EssayQuestion key={field.id} />
          ))}

          <Button
            variant="outline"
            className="h-full w-full p-5"
            onClick={() =>
              essayField.append({
                question: "",
                answer: "",
              })
            }
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
