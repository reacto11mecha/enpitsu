import path from "path";
import { fileURLToPath } from "url";

import { validateQuestionFromQueue } from "./src/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

void validateQuestionFromQueue(__dirname);
