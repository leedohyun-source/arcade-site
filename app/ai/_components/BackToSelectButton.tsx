"use client";

import { useRouter } from "next/navigation";

export default function BackToSelectButton({ className }: { className?: string }) {
  const router = useRouter();

  const goBack = () => {
    try {
      sessionStorage.setItem("returnToSelect", "1");
    } catch {}
    router.push("/?select=1");
  };

  return (
    <button
      onClick={goBack}
      className={
        className ??
        "cursor-pointer px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition"
      }
    >
      BACK
    </button>
  );
}
