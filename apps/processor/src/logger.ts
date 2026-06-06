import { createRequire } from "module";
import type pinoType from "pino";

// Open telemetry monkey patching.
// Honestly, wtf
const require = createRequire(import.meta.url);

const pino = require("pino") as typeof pinoType;

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "debug",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
    ],
  },
});
