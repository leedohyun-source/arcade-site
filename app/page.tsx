"use client";

import { useEffect, useRef, useState } from "react";

const FPS = 24;

// ===== 프레임 → 초 변환 유틸 =====
const f2s = (frame: number) => frame / FPS;
// end frame 포함 구간을 "끝(배타)"로 만들기: (endFrame+1)/fps
const endEx = (endFrame: number) => (endFrame + 1) / FPS;

// ===== 영상 구간 =====
const PLAY1 = { start: 0, end: 141 };
const LOOP2 = { start: 142, end: 330 };
const PLAY3 = { start: 331, end: 606 };
const LOOP4 = { start: 607, end: 797 };
const PLAY5 = { start: 798, end: 893 };
const LOOP6 = { start: 894, end: 1026 };

// ===== 오디오 페이드 시간 =====
const FADE_SEC = 1.0;

// ✅ LOOP 기본 볼륨 (원하는 값으로 조절)
const LOOP_VOL = 0.4;

type Stage = "BG" | "MAIN";
type Phase = "PLAY1" | "LOOP2" | "PLAY3" | "LOOP4" | "PLAY5" | "LOOP6";
type Category = "UA" | "BRANDED" | "AI" | null;

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ✅ 부팅(프리로드) 로딩 UI
  const [bootLoading, setBootLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(0); // 0~100

  // ===== BGM_LOOP: WebAudio seamless loop =====
  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopGainRef = useRef<GainNode | null>(null);
  const loopSrcRef = useRef<AudioBufferSourceNode | null>(null);
  const loopBufRef = useRef<AudioBuffer | null>(null);
  const loopLoadingRef = useRef<Promise<void> | null>(null);

  // ===== BGM_ENTER: HTMLAudioElement =====
  const bgmEnterRef = useRef<HTMLAudioElement>(null);

  const stageRef = useRef<Stage>("BG");
  const phaseRef = useRef<Phase>("PLAY1");

  const [stage, setStage] = useState<Stage>("BG");
  const [phase, setPhase] = useState<Phase>("PLAY1");

  const [showDown, setShowDown] = useState(false);
  const [showEnterBtn, setShowEnterBtn] = useState(false);

  const enterMusicTriggeredRef = useRef(false);

  // ✅ LOOP6 UI Hover 상태
  const [hoverCat, setHoverCat] = useState<Category>(null);

  const setStageSafe = (s: Stage) => {
    stageRef.current = s;
    setStage(s);
  };

  const setPhaseSafe = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);

    // 버튼 노출은 phase로만 결정
    setShowDown(p === "LOOP2");
    setShowEnterBtn(p === "LOOP4");

    // LOOP6 외에는 hover 초기화
    if (p !== "LOOP6") setHoverCat(null);
  };

  // ===== HTMLAudio(ENTER) 페이드 유틸 =====
  const fadeVolume = (audio: HTMLAudioElement, from: number, to: number, sec: number) => {
    const start = performance.now();
    audio.volume = from;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (sec * 1000));
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ===== WebAudio(BGM_LOOP) =====
  const ensureAudioCtx = async () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = LOOP_VOL; // ✅ 기본 볼륨
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      loopGainRef.current = gain;
    }
    if (audioCtxRef.current.state !== "running") {
      await audioCtxRef.current.resume();
    }
  };

  const loadLoopBuffer = async () => {
    if (loopBufRef.current) return;
    if (loopLoadingRef.current) return loopLoadingRef.current;

    loopLoadingRef.current = (async () => {
      const ctx = audioCtxRef.current!;
      const res = await fetch("/videos/BGM_LOOP.wav");
      const arr = await res.arrayBuffer();
      loopBufRef.current = await ctx.decodeAudioData(arr);
    })();

    await loopLoadingRef.current;
    loopLoadingRef.current = null;
  };

  const startSeamlessLoop = (opts?: { loopStartSec?: number; loopEndSec?: number }) => {
    const ctx = audioCtxRef.current!;
    const gain = loopGainRef.current!;
    const buf = loopBufRef.current!;

    // 기존 source 정리
    try {
      loopSrcRef.current?.stop();
    } catch {}
    try {
      loopSrcRef.current?.disconnect();
    } catch {}

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    if (opts?.loopStartSec != null) src.loopStart = opts.loopStartSec;
    if (opts?.loopEndSec != null) src.loopEnd = opts.loopEndSec;

    src.connect(gain);
    src.start();

    loopSrcRef.current = src;
  };

  const fadeLoopGain = (to: number, sec: number) => {
    const ctx = audioCtxRef.current!;
    const gain = loopGainRef.current!;
    const now = ctx.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + sec);
  };

  const stopLoopAfterFade = (sec: number) => {
    if (!audioCtxRef.current || !loopGainRef.current) return;

    fadeLoopGain(0, sec);

    const ctx = audioCtxRef.current!;
    const src = loopSrcRef.current;
    if (src) {
      const t = ctx.currentTime + sec + 0.03;
      try {
        src.stop(t);
      } catch {}
    }
  };

  const hardStopLoop = () => {
    try {
      loopSrcRef.current?.stop();
    } catch {}
    try {
      loopSrcRef.current?.disconnect();
    } catch {}

    loopSrcRef.current = null;

    if (audioCtxRef.current && loopGainRef.current) {
      const ctx = audioCtxRef.current;
      const gain = loopGainRef.current;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(LOOP_VOL, now); // ✅ 리셋도 원하는 볼륨
    }
  };

  // ✅ 부팅 프리로드: BG 첫 프레임 준비 + intro/audio 캐시 워밍
  useEffect(() => {
  let cancelled = false;

  const preload = async () => {
    try {
      const v = videoRef.current;
      if (!v) return;

      // BG 메타데이터까지만 준비 (모바일 안정)
      v.src = "/videos/BG01.mp4";
      v.loop = true;
      v.muted = true;
      v.currentTime = 0;
      v.load(); // 모바일에서 이벤트 안 뜨는 것 방지

      const waitBGReady = new Promise<void>((resolve) => {
        const onReady = () => {
          v.removeEventListener("loadedmetadata", onReady);
          resolve();
        };
        v.addEventListener("loadedmetadata", onReady);
      });

      // 🔑 모바일에서는 큰 mp4 프리로드 안 함 (오디오만)
      const assets = ["/videos/BGM_LOOP.wav", "/videos/BGM_ENTER.mp3"];

      let done = 0;
      const total = assets.length + 1;

      const bump = () => {
        done += 1;
        const pct = Math.round((done / total) * 100);
        if (!cancelled) setBootProgress(pct);
      };

      // ⏱️ 4초 타임아웃 (어떤 경우든 멈추지 않게)
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));

      await Promise.race([waitBGReady, timeout]);
      bump();

      await Promise.all(
        assets.map(async (url) => {
          try {
            await fetch(url, { cache: "force-cache" });
          } catch {}
          bump();
        })
      );

      if (!cancelled) {
        setBootLoading(false);
        v.play().catch(() => {});
      }
    } catch {
      if (!cancelled) setBootLoading(false);
    }
  };

  preload();
  return () => {
    cancelled = true;
  };
}, []);

  // ===== BG 화면 유지 =====
  useEffect(() => {
    if (bootLoading) return; // ✅ 프리로드 끝나기 전엔 여기서 덮어쓰지 않음
    if (stage !== "BG") return;

    const v = videoRef.current;
    if (!v) return;

    v.src = "/videos/BG01_v2.mp4";
    v.loop = true;
    v.muted = true;
    v.currentTime = 0;
    v.play().catch(() => {});

    // BG에서는 오디오 둘 다 정지
    hardStopLoop();

    const enter = bgmEnterRef.current;
    if (enter) {
      enter.pause();
      enter.currentTime = 0;
      enter.volume = 1;
    }

    enterMusicTriggeredRef.current = false;
    setPhaseSafe("PLAY1");
  }, [stage, bootLoading]);

  // ===== RAF 상태머신 =====
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const v = videoRef.current;
      if (!v) return;

      if (stageRef.current === "MAIN") {
        const t = v.currentTime;
        const p = phaseRef.current;

        if (p === "PLAY1") {
          if (t >= endEx(PLAY1.end)) {
            v.currentTime = f2s(LOOP2.start);
            v.play().catch(() => {});
            setPhaseSafe("LOOP2");
          }
        } else if (p === "LOOP2") {
          if (t >= endEx(LOOP2.end)) {
            v.currentTime = f2s(LOOP2.start);
            v.play().catch(() => {});
          }
        } else if (p === "PLAY3") {
          if (t >= endEx(PLAY3.end)) {
            v.currentTime = f2s(LOOP4.start);
            v.play().catch(() => {});
            setPhaseSafe("LOOP4");
          }
        } else if (p === "LOOP4") {
          if (t >= endEx(LOOP4.end)) {
            v.currentTime = f2s(LOOP4.start);
            v.play().catch(() => {});
          }
        } else if (p === "PLAY5") {
          if (t >= endEx(PLAY5.end)) {
            v.currentTime = f2s(LOOP6.start);
            v.play().catch(() => {});
            setPhaseSafe("LOOP6");
          }
        } else if (p === "LOOP6") {
          if (t >= endEx(LOOP6.end)) {
            v.currentTime = f2s(LOOP6.start);
            v.play().catch(() => {});
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 언마운트 시 AudioContext 정리
  useEffect(() => {
    return () => {
      try {
        hardStopLoop();
        audioCtxRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== ENTER 클릭: intro.mp4 시작 + BGM_LOOP 시작 =====
  const handleStartMain = async () => {
    // 로딩 중엔 클릭 막기 (안전)
    if (bootLoading) return;

    const v = videoRef.current;
    if (!v) return;

    setStageSafe("MAIN");
    setPhaseSafe("PLAY1");

    v.src = "/videos/intro_v2.mp4";
    v.loop = false;
    v.muted = false; // 나레이션 포함
    v.currentTime = f2s(PLAY1.start);

    // ENTER BGM 초기화
    enterMusicTriggeredRef.current = false;
    const enter = bgmEnterRef.current;
    if (enter) {
      enter.pause();
      enter.currentTime = 0;
      enter.volume = 1;
    }

    // WebAudio Loop 시작
    await ensureAudioCtx();
    await loadLoopBuffer();

    fadeLoopGain(LOOP_VOL, 0.01);
    startSeamlessLoop();

    await v.play().catch(() => {});
  };

  // ===== LOOP2의 ↓ 버튼: PLAY3로 점프 =====
  const handleDownToPlay3 = async () => {
    const v = videoRef.current;
    if (!v) return;

    setPhaseSafe("PLAY3");
    v.currentTime = f2s(PLAY3.start);
    await v.play().catch(() => {});
  };

  // ===== LOOP4의 ENTER 버튼: PLAY5로 점프 + 음악 트리거(한 번) =====
  const handleEnterToPlay5 = async () => {
    const v = videoRef.current;
    if (!v) return;

    setPhaseSafe("PLAY5");
    v.currentTime = f2s(PLAY5.start);
    await v.play().catch(() => {});

    if (!enterMusicTriggeredRef.current) {
      enterMusicTriggeredRef.current = true;

      stopLoopAfterFade(FADE_SEC);

      const enter = bgmEnterRef.current;
      if (enter) {
        enter.loop = false;
        enter.currentTime = 0;
        enter.volume = 0;
        enter.play().catch(() => {});
        fadeVolume(enter, 0, 1, FADE_SEC);
      }
    }
  };

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* ✅ 프리로딩 오버레이 */}
      {bootLoading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="w-[320px] max-w-[80vw]">
            <div className="text-white/80 text-sm tracking-[0.22em] text-center mb-4">
              LOADING
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/70 transition-[width] duration-300"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="text-white/50 text-xs text-center mt-3">{bootProgress}%</div>
          </div>
        </div>
      )}

      {/* VIDEO */}
      <video
        ref={videoRef}
        preload="auto"
        className={[
          "absolute inset-0 w-full h-full",
          stage === "MAIN" ? "object-contain bg-black" : "object-cover",
        ].join(" ")}
        playsInline
      />

      {/* AUDIO (ENTER만) */}
      <audio ref={bgmEnterRef} src="/videos/BGM_ENTER.mp3" preload="auto" />

      {/* BG 어둡게 누르는 오버레이 */}
      {stage === "BG" && <div className="absolute inset-0 bg-black/50 pointer-events-none" />}

      {/* BG ENTER UI */}
      {stage === "BG" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-xs opacity-60 mb-1">Sound on</div>
          <div className="text-lg mb-6">소리를 켜세요</div>
          <button
            onClick={handleStartMain}
            className="px-10 py-3 border border-white/70 rounded-full tracking-widest hover:bg-white hover:text-black transition"
          >
            ENTER
          </button>
        </div>
      )}

      {/* LOOP2: ↓ 버튼 */}
      {stage === "MAIN" && showDown && (
        <button
          onClick={handleDownToPlay3}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition"
        >
          ↓
        </button>
      )}

      {/* LOOP4: ENTER 버튼 */}
      {stage === "MAIN" && showEnterBtn && (
        <button
          onClick={handleEnterToPlay5}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-3 border border-white/70 rounded-full tracking-widest text-white hover:bg-white hover:text-black transition"
        >
          ENTER
        </button>
      )}

      {/* ✅ LOOP6: SELECT CATEGORY + 3개 오락기 호버 인터랙션 */}
      {stage === "MAIN" && phase === "LOOP6" && (
        <div className="absolute inset-0">
          {/* 상단 타이틀 */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-5 py-2 rounded-full border border-white/20 bg-black/35 backdrop-blur-md text-white tracking-[0.22em] text-sm">
              SELECT CATEGORY
            </div>
          </div>

          {/* 호버 시 전체 살짝 딤 */}
          {hoverCat && <div className="absolute inset-0 bg-black/25 transition-opacity duration-200" />}

          {/* 3개 오락기 핫스팟 */}
          <div className="absolute inset-0 pointer-events-auto">
            {/* LEFT: UA 콘텐츠 */}
            <div
              className="absolute bottom-[30%] left-[7%] w-[24%] h-[75%]"
              onMouseEnter={() => setHoverCat("UA")}
              onMouseLeave={() => setHoverCat(null)}
            >
              <div
                className={[
                  "absolute inset-0 rounded-[28px] transition-opacity duration-200",
                  hoverCat === "UA" ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-[28px] bg-yellow-300/15 blur-2xl mix-blend-screen" />
              </div>

              <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2">
                <div
                  className={[
                    "px-4 py-2 rounded-full border border-white/20 backdrop-blur-md",
                    "text-white text-sm tracking-wide",
                    hoverCat === "UA" ? "bg-white/15" : "bg-black/50",
                  ].join(" ")}
                >
                  UA 콘텐츠
                </div>
              </div>
            </div>

            {/* MID: 브랜디드 */}
            <div
              className="absolute bottom-[30%] left-[38%] w-[24%] h-[75%]"
              onMouseEnter={() => setHoverCat("BRANDED")}
              onMouseLeave={() => setHoverCat(null)}
            >
              <div
                className={[
                  "absolute inset-0 rounded-[28px] transition-opacity duration-200",
                  hoverCat === "BRANDED" ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-[28px] bg-yellow-300/15 blur-2xl mix-blend-screen" />
              </div>

              <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2">
                <div
                  className={[
                    "px-4 py-2 rounded-full border border-white/20 backdrop-blur-md",
                    "text-white text-sm tracking-wide",
                    hoverCat === "BRANDED" ? "bg-white/15" : "bg-black/30",
                  ].join(" ")}
                >
                  브랜디드
                </div>
              </div>
            </div>

            {/* RIGHT: AI 콘텐츠 */}
            <div
              className="absolute bottom-[30%] left-[68%] w-[24%] h-[75%]"
              onMouseEnter={() => setHoverCat("AI")}
              onMouseLeave={() => setHoverCat(null)}
            >
              <div
                className={[
                  "absolute inset-0 rounded-[28px] transition-opacity duration-200",
                  hoverCat === "AI" ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-[28px] bg-yellow-300/15 blur-2xl mix-blend-screen" />
              </div>

              <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2">
                <div
                  className={[
                    "px-4 py-2 rounded-full border border-white/20 backdrop-blur-md",
                    "text-white text-sm tracking-wide",
                    hoverCat === "AI" ? "bg-white/15" : "bg-black/30",
                  ].join(" ")}
                >
                  AI 콘텐츠
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
