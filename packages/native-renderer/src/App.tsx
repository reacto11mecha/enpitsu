import { ActualTest } from "@/components/Test/ActualTest";

function App() {
  return (
    <>
      <ActualTest
        data={{
          id: 25,
          startedAt: new Date("2024"),
          endedAt: new Date("2025"),
          multipleChoices: [],
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
