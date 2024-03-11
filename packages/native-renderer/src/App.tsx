import { ActualTest } from "@/components/Test/ActualTest";

function App() {
  return (
    <>
      <ActualTest
        initialData={[]}
        data={{
          id: 25,
          startedAt: new Date("2024"),
          endedAt: new Date("2025"),
          multipleChoices: [
            {
              iqid: 1,
              options: [
                { order: 1, answer: "" },
                { order: 2, answer: "" },
                { order: 3, answer: "" },
                { order: 4, answer: "" },
                { order: 5, answer: "" },
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
