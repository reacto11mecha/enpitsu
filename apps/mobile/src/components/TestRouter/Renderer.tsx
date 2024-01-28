import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import type { FieldArrayWithId } from "react-hook-form";
import { Card, Label, RadioGroup, XStack } from "tamagui";

import type { TFormSchema } from "./utils";

type TItem = FieldArrayWithId<TFormSchema, "multipleChoices", "id">;

export function RenderChoiceQuestion({
  item,
  currPick,
  index,
  updateAnswer,
}: {
  item: TItem;
  currPick: number;
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

              <Label htmlFor={`${index}.${option.order}`} width={width}>
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
