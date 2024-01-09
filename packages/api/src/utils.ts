import stringSimilarity from "string-similarity";

export const compareTwoStringLikability = (
  isStrict: boolean,
  first: string,
  second: string,
) => {
  if (isStrict) {
    if (first === second) return "1";

    return "0";
  }

  if (first === second) {
    return "1";
  } else if (first.toLowerCase() === second.toLowerCase()) {
    return "1";
  }

  return stringSimilarity
    .compareTwoStrings(first, second)
    .toFixed(5)
    .toString();
};
