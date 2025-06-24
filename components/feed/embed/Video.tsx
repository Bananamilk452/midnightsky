"use client";

import { AppBskyEmbedVideo } from "@atproto/api";
import Hls from "hls.js";
import { useRef } from "react";

export function FeedVideo({ content }: { content: AppBskyEmbedVideo.View }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (videoRef.current) {
    const hls = new Hls();
    hls.loadSource(content.playlist);
    hls.attachMedia(videoRef.current);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.current?.play();
    });
  }

  return (
    <div className="mt-2">
      <video
        ref={videoRef}
        className="h-auto max-h-[515px] rounded-lg border border-white/30"
        controls
        muted
        autoPlay
        playsInline
      />
    </div>
  );
}
