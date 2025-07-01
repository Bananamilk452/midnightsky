import { z } from "zod";

export type CreatePostParams = z.infer<typeof CreatePostSchema>;
export const CreatePostSchema = z.object({
  content: z.string(),
  blueskyContent: z.string().max(250, "최대 250자까지 입력 가능합니다."),
  type: z.enum(["public", "private"]),
});
