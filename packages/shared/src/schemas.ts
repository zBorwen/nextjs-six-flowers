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
