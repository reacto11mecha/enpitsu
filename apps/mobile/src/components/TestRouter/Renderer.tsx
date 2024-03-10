import { Pressable, useColorScheme, View } from "react-native";
import { WebView } from "react-native-webview";
import type { FieldArrayWithId } from "react-hook-form";
import { Card, Label, RadioGroup, Text, TextArea, XStack } from "tamagui";

import type { TFormSchema } from "./utils";

type TChoice = FieldArrayWithId<TFormSchema, "multipleChoices", "id">;
type TEssay = FieldArrayWithId<TFormSchema, "essays", "id">;

const pageBuilder = (
  content: string,
  colorMode: string,
) => String.raw`<!DOCTYPE html>
<html class="${colorMode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">

  <script src="https://cdn.tailwindcss.com"></script>

   <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  
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

export const EachChoiceOption = ({
  order,
  update,
  html,
}: {
  order: string;
  update: (val: string) => void;
  html: string;
}) => {
  const [height, setHeight] = React.useState(0);

  return (
    <XStack display="flex" alignItems="center" space="$2">
      <RadioGroup.Item value={order}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>

      <Pressable
        onPress={() => update(order as unknown as string)}
        style={{ width: "90%" }}
      >
        <View style={{ height }}>
          <WebView
            useWebView2={true}
            setBuiltInZoomControls={false}
            scrollEnabled={false}
            onMessage={(event) => {
              setHeight(parseInt(event.nativeEvent.data));
            }}
            injectedJavaScript={webViewScript}
            style={{ backgroundColor: "transparent" }}
            source={{ html }}
          />
        </View>
      </Pressable>
    </XStack>
  );
};

export const RenderChoiceQuestion = React.memo(
  function RenderChoiceQuestionConstructor({
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

    const updateCallback = React.useCallback(
      (val: string) => updateAnswer(parseInt(val)),
      [],
    );

    return (
      <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
        <Card.Header padded display="flex">
          <View style={{ flex: 1, flexGrow: 1, height }}>
            <WebView
              useWebView2={true}
              setBuiltInZoomControls={false}
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
            onValueChange={updateCallback}
            gap="$5"
          >
            {item.options.map((option) => (
              <EachChoiceOption
                key={option.order}
                order={String(option.order)}
                update={updateCallback}
                html={pageBuilder(option.answer, colorScheme)}
              />
            ))}
          </RadioGroup>
        </Card.Footer>
      </Card>
    );
  },
);

export const RenderEssayQuestion = React.memo(
  function RenderEssayQuestionConstructor({
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
              useWebView2={true}
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
  },
);
