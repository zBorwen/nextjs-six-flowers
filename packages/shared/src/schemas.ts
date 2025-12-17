import { z } from 'zod';

export const CreateRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
});

export const JoinRoomSchema = z.object({
  roomId: z.string(),
  playerName: z.string().min(1).max(20),
});

export const DrawCardSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export const DiscardCardSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  cardId: z.string(),
});

export const FlipCardSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  cardId: z.string(),
});

export type CreateRoomPayload = z.infer<typeof CreateRoomSchema>;
export type JoinRoomPayload = z.infer<typeof JoinRoomSchema>;
export type DrawCardPayload = z.infer<typeof DrawCardSchema>;
export type DiscardCardPayload = z.infer<typeof DiscardCardSchema>;
export type FlipCardPayload = z.infer<typeof FlipCardSchema>;

// --- Auth Schemas ---

export const RegisterSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  captcha: z.string().length(4, "Captcha must be 4 characters"),
});

export const LoginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export type RegisterPayload = z.infer<typeof RegisterSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;

// --- Game Action Schemas ---

export const DeclareRiichiSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export const ClaimRonSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export const HostRestartSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export type DeclareRiichiPayload = z.infer<typeof DeclareRiichiSchema>;
export type ClaimRonPayload = z.infer<typeof ClaimRonSchema>;
export type HostRestartPayload = z.infer<typeof HostRestartSchema>;
