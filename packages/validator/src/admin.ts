import { z } from "zod";

export const UpdateAcceptRoleSchema = z.object({
  role: z.enum(["user", "admin"], {
    required_error: "Dimohon untuk memilih tingkatan pengguna",
  }),
});

export type TUpdateAcceptRoleSchema = z.infer<typeof UpdateAcceptRoleSchema>;

export const ToggleCanLoginSchema = z.object({
  canLogin: z.boolean(),
});

export type TToggleCanLoginSchema = z.infer<typeof ToggleCanLoginSchema>;

const tokenSourceBase = z.string().min(3);
const tokenFlagsBase = z.string();

export const TokenSettingFormSchema = z.object({
  tokenSource: tokenSourceBase,
  tokenFlags: tokenFlagsBase,
  minimalTokenLength: z.coerce.number(),
  maximalTokenLength: z.coerce.number(),
});

export type TTokenSettingFormSchema = z.infer<typeof TokenSettingFormSchema>;

// TRPC Server Side Schema
export const BasicIdString = z.object({ id: z.string() });

export const AppRoleSchema = z.object({
  id: z.string(),
  role: z.enum(["admin", "user"]),
});

export const TokenSetting = z.object({
  tokenSource: tokenSourceBase,
  tokenFlags: tokenFlagsBase,
  minimalTokenLength: z.number(),
  maximalTokenLength: z.number(),
});
