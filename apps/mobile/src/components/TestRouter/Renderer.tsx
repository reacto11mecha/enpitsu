import { useWindowDimensions, View, useColorScheme } from "react-native";
import RenderHtml from "react-native-render-html";
import { WebView } from 'react-native-webview';
import type { FieldArrayWithId } from "react-hook-form";
import { Card, Label, RadioGroup, TextArea, Text, XStack } from "tamagui";

import type { TFormSchema } from "./utils";

type TChoice = FieldArrayWithId<TFormSchema, "multipleChoices", "id">;
type TEssay = FieldArrayWithId<TFormSchema, "essays", "id">;

const pageBuilder = (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    * {
      color: white;
      background-color: transparent;
    }
  </style>
</head>
<body className="text-white">
  ${content}
</body>
</html>`

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
  const colorScheme = useColorScheme();

  return (
    <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
      <Card.Header padded display="flex">
        <View style={{ flex: 1, flexGrow: 1, height: 30 }}>
          <WebView 
            style={{ backgroundColor: "transparent" }}
            source={{ html: pageBuilder(item.question) }}
          />
        </View>
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
                width="100%"
                disabled={disabled}
              >
        <View style={{ width: "100%"}}>
          <WebView 
            automaticallyAdjustContentInsets={false}
            originWhitelist={['*']}
            scrollEnabled={false}
            source={{ html: option.answer }}
          />
        </View>
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
