import { useColorScheme, View } from "react-native";
import RenderHtml from "react-native-render-html";
import { WebView } from "react-native-webview";
import type { FieldArrayWithId } from "react-hook-form";
import { Card, Label, RadioGroup, Text, TextArea, XStack } from "tamagui";

import type { TFormSchema } from "./utils";

type TChoice = FieldArrayWithId<TFormSchema, "multipleChoices", "id">;
type TEssay = FieldArrayWithId<TFormSchema, "essays", "id">;

const pageBuilder = (content: string, colorMode: string) => `<!DOCTYPE html>
<html class="${colorMode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script src="https://cdn.tailwindcss.com"></script>
  
  <script>
    tailwind.config = {
      darkMode: 'class'
    }
  </script>
</head>
<body class="dark:text-white">
  ${content}
</body>
</html>`;

const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(
      Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)
    ); 
  }, 900);
`;

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

  const [height, setHeight] = React.useState(0);

  return (
    <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
      <Card.Header padded display="flex">
        <View style={{ flex: 1, flexGrow: 1, height }}>
          <WebView
            scrollEnabled={false}
            onMessage={(event) => {
              setHeight(parseInt(event.nativeEvent.data));
            }}
            injectedJavaScript={webViewScript}
            style={{ backgroundColor: "transparent" }}
            source={{ html: pageBuilder(item.question, colorScheme) }}
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
                <View
                  style={{ height: 1200, flex: 1, flexGrow: 1, width: "100%" }}
                >
                  <WebView
                    scrollEnabled={false}
                    style={{ backgroundColor: "transparent" }}
                    source={{ html: pageBuilder(option.answer, colorScheme) }}
                  />
                </View>
              </RadioGroup.Item>
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
  const colorScheme = useColorScheme();

  const [height, setHeight] = React.useState(0);

  return (
    <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
      <Card.Header padded>
        <View style={{ flex: 1, flexGrow: 1, height }}>
          <WebView
            onMessage={(event) => {
              setHeight(parseInt(event.nativeEvent.data));
            }}
            injectedJavaScript={webViewScript}
            style={{ backgroundColor: "transparent" }}
            source={{ html: pageBuilder(item.question, colorScheme) }}
          />
        </View>
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
