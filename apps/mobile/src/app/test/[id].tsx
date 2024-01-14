import React from "react";
import { useLocalSearchParams } from "expo-router";

const TestPage = () => {
  const { id } = useLocalSearchParams();

  console.log(id);

  return <></>;
};

export default TestPage;
