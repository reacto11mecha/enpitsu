import { Text } from "tamagui";

export const MainRenderer = () => {
  console.log("mounted");
  console.log(mainRenderer, error);

  return (
    <>
      <Text>RN Suck</Text>
      {mainRenderer ? (
        <WebView
          source={{ uri: mainRenderer[0].uri }}
          style={{ flex: 0, width: 100, height: 500 }}
        />
      ) : null}
    </>
  );
};
