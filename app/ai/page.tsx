"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ContentItem = {
  youtubeUrl: string;
  fallbackTitle?: string; // oEmbed 실패 시 표시
};

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id || null;
    }
    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // youtube.com/embed/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function thumbUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// --- YouTube IFrame API loader (no key needed) ---
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();

  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) {
      // 이미 로드 중인 경우 ready 콜백만 대기
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(tag, first);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });

  return ytApiPromise;
}

export default function AiPage() {
  const router = useRouter();

  // ✅ AI 카테고리 목록(여기에만 추가하면 됨)
  const items: ContentItem[] = useMemo(
    () => [
      {
        youtubeUrl: "https://www.youtube.com/watch?v=6gJSHnAfUeA",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=MKlCyrXsXAg",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=Fd2TOTgV3kQ",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=msGe62jaVDM",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=79C6Ws6Oo0I",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=sCuiAoy7OE0",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=XdOwfYu45XQ",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=7ezlVp3B_GA",
        fallbackTitle: "YouTube Video",
      },
      {
        youtubeUrl: "https://www.youtube.com/watch?v=dfrd_6zOmzI",
        fallbackTitle: "YouTube Video",
      },
      
      // { youtubeUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX", fallbackTitle: "YouTube Video" },
    ],
    []
    
  );

  const mapped = useMemo(() => {
    return items
      .map((it) => {
        const id = getYouTubeId(it.youtubeUrl);
        return { ...it, id };
      })
      .filter((it) => it.id);
  }, [items]);

  const [openId, setOpenId] = useState<string | null>(null);
  const [titleMap, setTitleMap] = useState<Record<string, string>>({});

  // ✅ 유튜브 실제 제목(oEmbed) 로드: API 키 필요 없음
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const pairs = mapped.map((it) => ({
        id: it.id as string,
        url: it.youtubeUrl,
        fallback: it.fallbackTitle || "YouTube Video",
      }));

      const next: Record<string, string> = {};

      await Promise.all(
        pairs.map(async (p) => {
          try {
            const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(p.url)}&format=json`;
            const res = await fetch(oembed);
            if (!res.ok) throw new Error("oembed failed");
            const json = (await res.json()) as { title?: string };
            next[p.id] = json.title?.trim() || p.fallback;
          } catch {
            next[p.id] = p.fallback;
          }
        })
      );

      if (!cancelled) setTitleMap(next);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mapped]);

  const goBack = () => {
    try {
      sessionStorage.setItem("returnToSelect", "1");
    } catch {}
    router.push("/?select=1");
  };

  // ESC로 모달 닫기
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  // --- Player state ---
  const playerRef = useRef<any>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(80); // 0~100
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startRaf = () => {
    stopRaf();
    const tick = () => {
      const p = playerRef.current;
      if (p && typeof p.getCurrentTime === "function" && typeof p.getDuration === "function") {
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (Number.isFinite(d) && d > 0) setDuration(d);
          if (Number.isFinite(t) && t >= 0) setCurrent(t);
        } catch {}
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  
  // ✅ 모달 열릴 때: YouTube Player를 생성 (controls 숨김) + 커스텀 컨트롤만 제공
  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      if (!openId) return;
      await loadYouTubeIframeApi();
      if (cancelled) return;

      // 기존 플레이어 제거
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      stopRaf();

      setIsPlaying(false);
      setDuration(0);
      setCurrent(0);

      const host = playerHostRef.current;
      if (!host) return;

      // 컨테이너 초기화
      host.innerHTML = "";
      host.style.position = "relative";
      host.style.width = "100%";
      host.style.height = "100%";

      // Player 생성
      playerRef.current = new window.YT.Player(host, {
        videoId: openId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0, // 유튜브 자체 fullscreen 버튼 비활성
          disablekb: 1,
          // showinfo는 더이상 공식 지원은 아니지만, 일부 환경에서 불필요 UI가 줄어들기도 함
          showinfo: 0,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (e: any) => {
            try {
              const d = e?.target?.getDuration?.();
              if (Number.isFinite(d) && d > 0) setDuration(d);
            } catch {}

            // iframe이 컨테이너를 100% 채우도록 강제
            try {
              const iframe = host.querySelector("iframe") as HTMLIFrameElement | null;
              if (iframe) {
                iframe.style.position = "absolute";
                iframe.style.inset = "0";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "0";
                iframe.setAttribute("allowfullscreen", "true");
                iframe.setAttribute(
                  "allow",
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                );
              }
            } catch {}

            // 초기 볼륨/뮤트 반영
            try {
              const p = e?.target;
              if (muted) p.mute?.();
              else p.unMute?.();
              p.setVolume?.(volume);
            } catch {}

            setIsPlaying(true);
            startRaf();
          },
          onStateChange: (e: any) => {
            const st = e?.data; // 1: playing, 2: paused, 0: ended
            if (st === 1) setIsPlaying(true);
            if (st === 2 || st === 0) setIsPlaying(false);
          },
        },
      });
    };

    mount();

    return () => {
      cancelled = true;
      stopRaf();
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [openId]);

  // ✅ 볼륨/뮤트 상태를 Player에 동기화 (플레이어 재생성 ❌)
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (muted) p.mute?.();
      else p.unMute?.();
      p.setVolume?.(volume);
    } catch {}
  }, [volume, muted]);

  // ✅ Fullscreen 상태 감지 (ESC 등으로 종료될 때도 UI 갱신)
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (isPlaying) p.pauseVideo();
      else p.playVideo();
    } catch {}
  };

  const seekTo = (t: number) => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.seekTo(Math.max(0, Math.min(t, duration || t)), true);
      setCurrent(t);
    } catch {}
  };


  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (muted) {
        p.unMute?.();
        setMuted(false);
      } else {
        p.mute?.();
        setMuted(true);
      }
    } catch {}
  };

  const onChangeVolume = (v: number) => {
    const vv = Math.max(0, Math.min(100, Math.round(v)));
    setVolume(vv);
    if (vv === 0) setMuted(true);
    else setMuted(false);
    try {
      const p = playerRef.current;
      if (!p) return;
      if (vv === 0) p.mute?.();
      else {
        p.unMute?.();
        p.setVolume?.(vv);
      }
    } catch {}
  };

  const toggleFullscreen = async () => {
    const el = playerWrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // 일부 브라우저/환경에서 실패할 수 있음 (특히 iOS Safari)
    }
  };
  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec)) return "0:00";
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* ✅ 배경: /public/images/contents_bg.jpg (비율 유지, 레터박스 허용) */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: "url(/images/contents_bg.jpg)" }}
      />

      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 py-10 text-white">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs tracking-[0.22em] text-white/70">CATEGORY</div>
            <h1 className="text-2xl mt-1">AI CONTENTS</h1>
          </div>

          <button
            onClick={goBack}
            className="cursor-pointer px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition"
          >
            BACK
          </button>
        </div>

        {/* ✅ 단순 썸네일 목록 */}
        <div className="mt-8 h-[calc(100%-5.5rem)] overflow-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapped.map((it) => {
              const id = it.id as string;
              return (
                <button
                  key={id}
                  onClick={() => setOpenId(id)}
                  className="cursor-pointer text-left rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md overflow-hidden hover:bg-black/35 transition focus:outline-none"
                >
                  <div className="aspect-video bg-black/40">
                    <img
                      src={thumbUrl(id)}
                      alt={titleMap[id] || it.fallbackTitle || "YouTube Video"}
                      className="w-full h-full object-cover"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm">{titleMap[id] || it.fallbackTitle || "Loading..."}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="h-10" />
        </div>
      </div>

      {/* ✅ 모달: "위 제목/링크복사" 제거 + 아래는 Play/Pause + 진행바만 */}
      {openId && (
        <div
          className="fixed inset-0 z-50 bg-black/85 cursor-default"
          onMouseDown={(e) => {
            const panel = modalPanelRef.current;
            if (panel && !panel.contains(e.target as Node)) setOpenId(null);
          }}
        >
          <div className="h-full w-full p-4 sm:p-8 flex items-center justify-center">
            <div ref={modalPanelRef} className="relative w-full max-w-6xl">
              {/* 닫기 버튼: 모달 박스 바깥(상단 우측) */}
              <button
                onClick={() => setOpenId(null)}
                className="absolute -top-14 right-0 sm:-top-16 cursor-pointer w-11 h-11 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center"
                aria-label="close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* 플레이어 래퍼: 가능한 크게, 비율 유지(잘림 없이) */}
              <div
                ref={playerWrapRef}
                className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/12 bg-black shadow-2xl"
              >
                {/* YouTube iframe host */}
                <div
                  ref={playerHostRef}
                  className="absolute inset-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
                />

                {/* 클릭으로 재생/정지 (컨트롤 영역은 제외) */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 z-10 w-full h-full cursor-pointer"
                  aria-label="toggle play"
                />

                {/* 컨트롤 오버레이 (미니멀) */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
                  <div className="pointer-events-auto px-4 sm:px-5 py-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center"
                        aria-label="play pause"
                      >
                        <span className="text-sm">{isPlaying ? "❚❚" : "▶"}</span>
                      </button>

                      {/* Time */}
                      <div className="text-xs text-white/70 tabular-nums w-[3.75rem]">
                        {formatTime(current)}
                      </div>

                      {/* Seek */}
                      <input
                        className="flex-1 cursor-pointer accent-white/80"
                        type="range"
                        min={0}
                        max={Math.max(1, Math.floor(duration || 1))}
                        value={Math.floor(current)}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        aria-label="seek"
                      />

                      <div className="text-xs text-white/70 tabular-nums w-[3.75rem] text-right">
                        {duration > 0 ? formatTime(duration) : "—:—"}
                      </div>

                      {/* Volume */}
                      <button
                        onClick={toggleMute}
                        className="cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center"
                        aria-label="mute"
                        title={muted || volume === 0 ? "Unmute" : "Mute"}
                      >
                        {muted || volume === 0 ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M11 5l-4 4H4v6h3l4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            <path d="M16 9l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M11 5l-4 4H4v6h3l4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            <path d="M16 10c1.5 1.5 1.5 4.5 0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M18.5 7.5c3 3 3 9 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>

                      <input
                        className="w-24 cursor-pointer accent-white/80 hidden sm:block"
                        type="range"
                        min={0}
                        max={100}
                        value={muted ? 0 : volume}
                        onChange={(e) => onChangeVolume(Number(e.target.value))}
                        aria-label="volume"
                      />

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center"
                        aria-label="fullscreen"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        <span className="text-sm">{isFullscreen ? "⤡" : "⛶"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모바일용 볼륨 슬라이더 (하단 여백) */}
              <div className="sm:hidden mt-4 px-1">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-white/70 w-10">{muted || volume === 0 ? "M" : "VOL"}</div>
                  <input
                    className="flex-1 cursor-pointer accent-white/80"
                    type="range"
                    min={0}
                    max={100}
                    value={muted ? 0 : volume}
                    onChange={(e) => onChangeVolume(Number(e.target.value))}
                    aria-label="volume mobile"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
