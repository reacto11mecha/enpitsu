import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import type { FieldArrayWithId } from "react-hook-form";
import { Card, Label, RadioGroup, TextArea, XStack } from "tamagui";

import type { TFormSchema } from "./utils";

type TChoice = FieldArrayWithId<TFormSchema, "multipleChoices", "id">;
type TEssay = FieldArrayWithId<TFormSchema, "essays", "id">;

export function RenderChoiceQuestion({
  item,
  currPick,
  disabled,
  index,
  updateAnswer,
}: {
  item: TChoice;
  currPick: number;
  disabled: boolean;
  index: number;
  updateAnswer: (order: number) => void;
}) {
  const { width } = useWindowDimensions();

  return (
    <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
      <Card.Header padded>
        <RenderHtml
          contentWidth={width}
          source={{ html: item.question }}
          tagsStyles={{
            body: {
              color: "white",
            },
          }}
        />
      </Card.Header>
      <Card.Footer padded>
        <RadioGroup
          disabled={disabled}
          value={String(currPick)}
          onValueChange={(val) => updateAnswer(parseInt(val))}
          gap="$2"
        >
          {item.options.map((option) => (
            <XStack key={option.order} alignItems="center" space="$2">
              <RadioGroup.Item
                value={String(option.order)}
                id={`${index}.${option.order}`}
              >
                <RadioGroup.Indicator />
              </RadioGroup.Item>

              <Label
                htmlFor={`${index}.${option.order}`}
                width={width}
                disabled={disabled}
              >
                <RenderHtml
                  contentWidth={width}
                  source={{ html: option.answer }}
                  tagsStyles={{
                    body: {
                      color: "white",
                    },
                  }}
                />
              </Label>
            </XStack>
          ))}
        </RadioGroup>
      </Card.Footer>
    </Card>
  );
}

export function RenderEssayQuestion({
  item,
  currAnswer,
  disabled,
  index,
  updateAnswer,
}: {
  item: TEssay;
  currAnswer: string;
  disabled: boolean;
  index: number;
  updateAnswer: (answer: string) => void;
}) {
  const { width } = useWindowDimensions();

  return (
    <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
      <Card.Header padded>
        <RenderHtml
          contentWidth={width}
          source={{ html: item.question }}
          tagsStyles={{
            body: {
              color: "white",
            },
          }}
        />
      </Card.Header>
      <Card.Footer padded>
        <TextArea
          size="$4"
          disabled={disabled}
          width="100%"
          borderWidth={2}
          value={currAnswer}
          onChangeText={updateAnswer}
        />
      </Card.Footer>
    </Card>
  );
}
