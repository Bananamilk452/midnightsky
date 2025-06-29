"use client";

import { AppBskyEmbedVideo } from "@atproto/api";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

export function FeedVideo({ content }: { content: AppBskyEmbedVideo.View }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const hls = new Hls();
      hls.loadSource(content.playlist);
      hls.attachMedia(videoRef.current);
    }
  }, [content.playlist]);

  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <video
        ref={videoRef}
        className="h-auto max-h-[515px] rounded-lg border border-white/30"
        controls
        muted
        playsInline
      />
    </div>
  );
}
