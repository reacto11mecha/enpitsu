import { useEffect, useState } from "react";
import { ActualTest } from "@/components/Test/ActualTest";
import type { Props } from "@/components/Test/utils";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/components/theme-provider";
import { RefreshCw } from "lucide-react";

function App() {
  const [initialData, setInitialData] = useState<null | Props["initialData"]>(
    null,
  );
  const [data, setData] = useState<null | Props["data"]>(null);
  const [studentToken, setStudentToken] = useState<null | string>(null);

  const { setTheme } = useTheme();

  useEffect(() => {
    if (window.isNativeApp && "ReactNativeWebView" in window) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ key: "CLIENT:INIT" }),
      );
    }

    window.initFillData = (
      initialData: Props["initialData"],
      data: Props["data"],
      studentToken: string,
      theme: Theme,
    ) => {
      setInitialData(initialData);
      setData(data);
      setStudentToken(studentToken);
      setTheme(theme);
    };

    window.updateRendererTheme = (theme: Theme) => setTheme(theme);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (window.isNativeApp && initialData && studentToken && data)
    return (
      <ActualTest
        initialData={initialData}
        data={data}
        studentToken={studentToken}
      />
    );

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <RefreshCw size={35} className="animate-spin" />
    </div>
  );
}

export default App;
