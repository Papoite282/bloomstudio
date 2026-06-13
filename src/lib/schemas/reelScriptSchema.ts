import { z } from "zod";

export const reelMotionSchema = z.enum([
  "slow_zoom_in",
  "slow_zoom_out",
  "pan_up",
  "pan_down",
  "static",
]);

export const reelSceneSchema = z.object({
  order: z.number().int().positive(),
  duration: z.number().positive(),
  assetIndex: z.number().int().min(0),
  onScreenText: z.string(),
  motion: reelMotionSchema,
  notes: z.string(),
});

export const reelScriptSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(1),
  scenes: z.array(reelSceneSchema).min(1),
  caption: z.string(),
  hashtags: z.array(z.string()),
  audioSuggestion: z.string(),
});

export type ReelScriptOutput = z.infer<typeof reelScriptSchema>;
export type ReelSceneOutput = z.infer<typeof reelSceneSchema>;
