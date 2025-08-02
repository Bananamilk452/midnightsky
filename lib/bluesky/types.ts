import { z } from "zod";

export type CreatePostParams = z.infer<typeof CreatePostSchema>;

const PostBaseSchema = {
  content: z.string(),
  blueskyContent: z.string().max(250, "최대 250자까지 입력 가능합니다."),
  reply: z
    .object({
      root: z.object({
        cid: z.string(),
        uri: z.string(),
      }),
      parent: z.object({
        cid: z.string(),
        uri: z.string(),
      }),
    })
    .optional(),
};

export const CreatePostSchema = z
  .object({
    ...PostBaseSchema,
    type: z.enum(["public", "private"]),
  })
  .or(
    z.object({
      ...PostBaseSchema,
      type: z.literal("list"),
      listId: z.string(),
    }),
  );
