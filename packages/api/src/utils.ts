import stringSimilarity from "string-similarity";

export const compareTwoStringLikability = (first: string, second: string) => {
  if (first === second) {
    return "1";
  } else if (first.toLowerCase() === second.toLowerCase()) {
    return "1";
  }

  return stringSimilarity.compareTwoStrings(first, second).toString();
};
