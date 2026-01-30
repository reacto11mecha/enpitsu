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

// TRPC Server Side Schema
export const BasicIdString = z.object({ id: z.string() });

export const AppRoleSchema = z.object({
  id: z.string(),
  role: z.enum(["admin", "user"]),
});
