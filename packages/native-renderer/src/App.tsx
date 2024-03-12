import { useEffect, useState } from "react";
import { ActualTest } from "@/components/Test/ActualTest";
import type { Prop } from "@/components/Test/utils";
import { RefreshCw } from "lucide-react";

function App() {
  const [data, setData] = useState<null | Prop["data"]>(null);
  const [studentToken, setStudentToken] = useState<null | string>(null);

  useEffect(() => {
    if (window.isNativeApp) {
      if ("ReactNativeWebView" in window) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ key: "CLIENT:INIT" }),
        );
      }
    }

    window.initFillData = (data: Prop["data"], studentToken: string) => {
      setData(data);
      setStudentToken(studentToken);
    };
  }, []);

  if (window.isNativeApp && studentToken && data)
    return (
      <>
        <ActualTest
          initialData={{
            checkIn: new Date("2024-01-31"),
            dishonestCount: 1,
            multipleChoices: [
              {
                iqid: 1,
                choosedAnswer: 3,
              },
            ],
            essays: [],
          }}
          data={data}
          studentToken={studentToken}
        />
        {JSON.stringify(window.isNativeApp)}
      </>
    );

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <RefreshCw size={35} className="animate-spin" />
    </div>
  );
}

export default App;
