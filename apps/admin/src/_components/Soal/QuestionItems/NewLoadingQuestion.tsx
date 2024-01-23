import { useEffect, useRef } from "react";

export const NewLoadingQuestion = () => {
  const loadingRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    loadingRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className={"bg-muted h-[35rem] w-full animate-pulse rounded-md"}
      ref={loadingRef}
    />
  );
};

export const BasicLoading = () => (
  <div className={"bg-muted h-[35rem] w-full animate-pulse rounded-md"} />
);
