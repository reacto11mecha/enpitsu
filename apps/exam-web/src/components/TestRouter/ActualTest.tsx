import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCountdown } from "@/hooks/useCountdown";
import type { RouterOutputs } from "@enpitsu/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle";
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    // FormLabel,
    FormMessage,
} from "@/components/ui/form"


type TData = RouterOutputs["exam"]["queryQuestion"];

const formSchema = z.object({
    multipleChoices: z.array(
        z.object({
            iqid: z.number(),
            question: z.string(),
            options: z
                .array(
                    z.object({
                        order: z.number(),
                        answer: z.string(),
                    }),
                )
                .min(5)
                .max(5),
            choosedAnswer: z.number().min(1, { message: "Jawaban harus di isi!" }),
        }),
    ),

    essays: z.array(
        z.object({
            iqid: z.number(),
            question: z.string(),
            answer: z.string().min(1, { message: "Jawaban harus di isi!" }),
        }),
    ),
});

export const ActualTest = ({ data }: { data: TData }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            multipleChoices: data.multipleChoices,
            essays: data.essays
        },
    });

    const multipleChoicesField = useFieldArray({
        control: form.control,
        name: "multipleChoices",
    });

    const essaysField = useFieldArray({
        control: form.control,
        name: "essays",
    });

    const { countdown, isEnded } = useCountdown(data.endedAt);

    const onSubmit = (values: z.infer<typeof formSchema>) => console.log({ ...values, submittedAt: new Date() })

    if (isEnded) return <p>Owarida.</p>;

    return (
        <>
            <header className="fixed inset-x-0 top-0 flex w-full justify-center border-solid">
                <div className="flex h-full w-full flex-wrap gap-4 items-center justify-between sm:justify-center bg-white px-5 p-2 dark:bg-stone-900 border border-b">
                    <Button variant="outline">
                        {countdown}
                    </Button>

                    <ModeToggle size="default" />
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-center px-4 pb-16 pt-20">
                    <div className="flex w-full max-w-lg flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                Pilihan Ganda
                            </h3>

                            <div className="flex flex-col gap-5">
                                {multipleChoicesField.fields.map((field, index) => (
                                    <Card key={field.id} className="w-full">
                                        <CardHeader>
                                            <h3 className="scroll-m-20 text-lg tracking-tight">
                                                {field.question}
                                            </h3>
                                        </CardHeader>
                                        <CardContent>
                                            <FormField
                                                control={form.control}
                                                name={`multipleChoices.${index}.choosedAnswer` as const}
                                                render={({ field: currentField }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormControl>
                                                            <RadioGroup
                                                                className="space-y-2"
                                                                value={String(currentField.value)}
                                                                onValueChange={val => currentField.onChange(parseInt(val))}
                                                            >
                                                                {field.options.map((option, idx) => (
                                                                    <div
                                                                        className="flex items-center space-x-2"
                                                                        key={`options.${field.iqid}.opt.${idx}`}
                                                                    >
                                                                        <RadioGroupItem
                                                                            value={String(option.order)}
                                                                            id={`options.${field.iqid}.opt.${idx}`}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`options.${field.iqid}.opt.${idx}`}
                                                                            className="text-base font-normal"
                                                                        >
                                                                            {option.answer}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                Esai
                            </h3>

                            <div className="flex flex-col gap-5">
                                {essaysField.fields.map((field, index) => (
                                    <Card key={field.iqid}>
                                        <CardHeader>
                                            <h3 className="scroll-m-20 text-base tracking-tight">
                                                {field.question}
                                            </h3>
                                        </CardHeader>
                                        <CardContent>
                                            <FormField
                                                control={form.control}
                                                name={`essays.${index}.answer` as const}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Jawab disini"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="uppercase">submit</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
};
