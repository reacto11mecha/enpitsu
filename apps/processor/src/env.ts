import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "",
  client: {},

  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),

    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url(),
    OTEL_EXPORTER_OTLP_PROTOCOL: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
