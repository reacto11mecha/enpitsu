import { customAlphabet } from "nanoid";

const customToken = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// const arrayValidator = customToken.split("");

export const nanoid = customAlphabet(customToken, 8);

// export const validateId = (id: string) =>
//   id
//     .split("")
//     .map((char) => arrayValidator.includes(char))

//     // Every item is true
//     .every((item) => item);

//const regex = /^[A-Z]{2}-[0-9]{3}$/;
const regex = /12-(10|11|12)-STS-\d{3}/;

export const validateId = (id: string) => regex.test(id);
