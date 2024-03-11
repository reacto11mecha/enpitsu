import { useEffect } from "react";
import { ActualTest } from "@/components/Test/ActualTest";

function App() {
  useEffect(() => {
    if (window.isNativeApp) {
      const data = window.ReactNativeWebView.injectedObjectJson();

      console.log(data);
    }
  }, []);

  return (
    <>
      <ActualTest
        initialData={{
          checkIn: new Date("2024-01-31"),
          dishonestyCount: 1,
          multipleChoices: [
            {
              iqid: 1,
              choosedAnswer: 3,
            },
          ],
          essays: [],
        }}
        data={{
          id: 25,
          startedAt: new Date("2024"),
          endedAt: new Date("2025"),
          multipleChoices: [
            {
              iqid: 1,
              options: [
                { order: 1, answer: "a" },
                { order: 2, answer: "b" },
                { order: 3, answer: "c" },
                { order: 4, answer: "d" },
                { order: 5, answer: "e" },
              ],
              question: "test",
            },
          ],
          essays: [],
          slug: "APA-AJA",
          title: "Apa aja, ngetest doang",
        }}
        studentToken="SMFIKZHA"
      />
    </>
  );
}

export default App;
