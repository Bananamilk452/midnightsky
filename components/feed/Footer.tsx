"use client";

import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  EllipsisIcon,
  HeartIcon,
  MessageSquareIcon,
  Repeat2Icon,
  ShareIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { useWriter } from "@/components/providers/WriterProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { validateRecord } from "@/lib/bluesky/utils";
import {
  useDeletePost,
  useLike,
  useRepost,
  useSession,
  useUnlike,
  useUnrepost,
} from "@/lib/hooks/useBluesky";
import { Record as Post } from "@/lib/lexicon/types/app/midnightsky/post";
import { cn, parseAtUri } from "@/lib/utils";

export function FeedFooter({
  post,
  className,
}: {
  post: PostView;
  className?: string;
}) {
  return (
    <>
      <div className={cn("flex items-center justify-between", className)}>
        <MentionButton post={post} />
        <RepostButton post={post} />
        <LikeButton post={post} />
        <ShareButton post={post} />
        <MenuButton post={post} />
      </div>
    </>
  );
}

function MentionButton({ post }: { post: PostView }) {
  const { openWriter } = useWriter();
  const record = validateRecord(post.record);
  const embed = record?.embed;

  const hideTypeSelect = embed?.$type === "app.midnightsky.post";

  function handleWriterOpen(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (record?.reply) {
      openWriter({
        reply: {
          root: record.reply.root,
          parent: {
            cid: post.cid,
            uri: post.uri,
          },
        },
        hideTypeSelect,
      });
    } else {
      openWriter({
        reply: {
          root: {
            cid: post.cid,
            uri: post.uri,
          },
          parent: {
            cid: post.cid,
            uri: post.uri,
          },
        },
        hideTypeSelect,
      });
    }
  }

  return (
    <FeedFooterButton
      disabled={post.viewer?.replyDisabled}
      onClick={handleWriterOpen}
    >
      <MessageSquareIcon className="size-4" />
      {post.replyCount && post.replyCount > 0 ? post.replyCount : ""}
    </FeedFooterButton>
  );
}

function RepostButton({ post }: { post: PostView }) {
  const [reposted, setReposted] = useState(Boolean(post.viewer?.repost));
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);

  const { mutate: repost } = useRepost();
  const { mutate: unrepost } = useUnrepost();

  function handleRepost(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (reposted) {
      unrepost([post.uri], {
        onError: (error) => {
          console.error("Error deleting repost:", error);
          setReposted(true);
          setRepostCount((prev) => prev + 1);
        },
      });
      setReposted(false);
      setRepostCount((prev) => prev - 1);
    } else {
      repost([{ cid: post.cid, uri: post.uri }], {
        onError: (error) => {
          console.error("Error liking post:", error);
          setReposted(false);
          setRepostCount((prev) => prev - 1);
        },
      });
      setReposted(true);
      setRepostCount((prev) => prev + 1);
    }
  }

  return (
    <FeedFooterButton
      onClick={handleRepost}
      className={reposted ? "text-green-600" : ""}
    >
      <Repeat2Icon className={reposted ? "size-5 text-green-600" : "size-5"} />
      {repostCount}
    </FeedFooterButton>
  );
}

function LikeButton({ post }: { post: PostView }) {
  const [liked, setLiked] = useState(Boolean(post.viewer?.like));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const { mutate: likePost } = useLike();
  const { mutate: unlikePost } = useUnlike();

  function handleLike(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (liked) {
      unlikePost([post.uri], {
        onError: (error) => {
          console.error("Error deleting like:", error);
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        },
      });
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      likePost([{ cid: post.cid, uri: post.uri }], {
        onError: (error) => {
          console.error("Error liking post:", error);
          setLiked(false);
          setLikeCount((prev) => prev - 1);
        },
      });
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  }

  return (
    <FeedFooterButton
      onClick={handleLike}
      className={liked ? "text-red-600" : ""}
    >
      <HeartIcon
        className={liked ? "size-4 fill-red-600 text-red-600" : "size-4"}
      />
      {likeCount}
    </FeedFooterButton>
  );
}

function ShareButton({ post }: { post: PostView }) {
  const [, copy] = useCopyToClipboard();

  function handleCopy(text: string) {
    copy(text)
      .then(() => {
        toast.success("클립보드에 링크가 복사되었습니다!");
      })
      .catch(() => {
        toast.error("링크 복사에 실패했습니다.");
      });
  }

  return (
    <FeedFooterButton
      onClick={(e) => {
        e.stopPropagation();
        const { rkey } = parseAtUri(post.uri);
        handleCopy(
          `${process.env.NEXT_PUBLIC_URL}/post/${post.author.did}/${rkey}`,
        );
      }}
    >
      <ShareIcon className="size-4" />
    </FeedFooterButton>
  );
}

function MenuButton({ post }: { post: PostView }) {
  const router = useRouter();

  const record = validateRecord(post.record);
  const embed = record?.embed;
  const isMidnightSkyPost = embed?.$type === "app.midnightsky.post";

  const { data: user } = useSession();
  const { mutate: deletePost } = useDeletePost();

  function handleDeletePost() {
    deletePost(
      [
        {
          uri: post.uri,
          post: isMidnightSkyPost
            ? { type: (embed as Post).type, postId: (embed as Post).id }
            : undefined,
        },
      ],
      {
        onSuccess: () => {
          toast.success("게시글이 삭제되었습니다.");
          router.replace("/home");
        },
        onError: (error) => {
          console.error("Error deleting post:", error);
          toast.error("게시글 삭제에 실패했습니다.");
        },
      },
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={user?.did !== post.author.did}>
        <FeedFooterButton
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <EllipsisIcon className="size-4" />
        </FeedFooterButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDeletePost}>
            <TrashIcon />
            게시글 삭제
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FeedFooterButton({
  children,
  className = "",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10 disabled:cursor-auto disabled:text-gray-500",
        className,
      )}
    >
      {children}
    </button>
  );
}
