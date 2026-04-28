import { z } from "zod";

const PostBaseSchema = (maxCharsMsg: string) => ({
  content: z.string(),
  blueskyContent: z.string().max(250, maxCharsMsg),
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
});

export const createPostSchema = (maxCharsMsg: string) =>
  z
    .object({
      ...PostBaseSchema(maxCharsMsg),
      type: z.enum(["public", "private"]),
    })
    .or(
      z.object({
        ...PostBaseSchema(maxCharsMsg),
        type: z.literal("list"),
        listId: z.string(),
      }),
    )
    .or(
      z.object({
        ...PostBaseSchema(maxCharsMsg),
        type: z.literal("reply"),
      }),
    );

export type CreatePostParams = z.infer<ReturnType<typeof createPostSchema>>;

export const CreatePostSchema = createPostSchema(
  "최대 250자까지 입력 가능합니다.",
);
