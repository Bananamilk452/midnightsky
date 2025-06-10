"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signInWithBluesky } from "@/lib/bluesky/action";

export default function Home() {
  const router = useRouter();

  const [handle, setHandle] = useState("");

  async function handleAuth() {
    if (!handle) {
      alert("Please enter your Bluesky handle.");
      return;
    }

    const url = await signInWithBluesky(handle);

    router.push(url);
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    setHandle(event.target.value);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your Bluesky handle"
        onChange={handleInput}
      />
      <button onClick={handleAuth}>Sign in with Bluesky</button>
    </div>
  );
}
