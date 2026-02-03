"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FPS = 24;

// ===== 프레임 → 초 변환 유틸 =====
const f2s = (frame: number) => frame / FPS;
// end frame 포함 구간을 "끝(배타)"로 만들기: (endFrame+1)/fps
const endEx = (endFrame: number) => (endFrame + 1) / FPS;

// ===== 시킹(프레임 점프) 유틸: seeked 이벤트를 기다려 시작 프레임 어긋남 최소화 =====
const seekTo = (v: HTMLVideoElement, sec: number, timeoutMs = 160) =>
  new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        v.removeEventListener("seeked", onSeeked);
      } catch {}
      resolve();
    };
    const onSeeked = () => finish();

    try {
      v.addEventListener("seeked", onSeeked, { once: true } as any);
    } catch {
      // Safari 구형 대비
      v.addEventListener("seeked", onSeeked as any);
    }

    const anyV: any = v;
    try {
      if (typeof anyV.fastSeek === "function") anyV.fastSeek(sec);
      else v.currentTime = sec;
    } catch {
      v.currentTime = sec;
    }

    // 일부 환경에서 seeked가 안 오거나 늦게 오는 경우 대비
    setTimeout(finish, timeoutMs);
  });

// ===== 영상 구간 =====
const PLAY1 = { start: 0, end: 141 };
const LOOP2 = { start: 142, end: 330 };
const PLAY3 = { start: 331, end: 606 };
const LOOP4 = { start: 607, end: 797 };
const PLAY5 = { start: 798, end: 893 };
// ✅ 엔드(셀렉트) 상태에서 3분할 호버 루프 구간
const HOVER_L = { start: 894, end: 915 };
const HOVER_C = { start: 918, end: 938 };
const HOVER_R = { start: 942, end: 960 };

// ✅ 선택 클릭 줌인(재생 후 라우팅)
const CLICK_UA = { start: 966, end: 1023, path: "/ua" };
const CLICK_BRANDED = { start: 1025, end: 1082, path: "/branded" };
const CLICK_AI = { start: 1084, end: 1131, path: "/ai" };

// ===== 오디오 페이드 시간 =====
const FADE_SEC = 1.0;

// ✅ LOOP 기본 볼륨 (원하는 값으로 조절)
const LOOP_VOL = 0.4;
type Stage = "BG" | "MAIN";
type Phase = "PLAY1" | "LOOP2" | "PLAY3" | "LOOP4" | "PLAY5";

type HoverZone = "LEFT" | "CENTER" | "RIGHT" | null;

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // ✅ UA/다른 페이지에서 '셀렉트(893f)로 복귀' 요청이 있으면 즉시 셀렉트 화면으로 점프
  useEffect(() => {
    if (typeof window === "undefined") return;

    let want = false;
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("select") === "1") want = true;
      if (sessionStorage.getItem("returnToSelect") === "1") want = true;
    } catch {}

    if (!want) return;

    // 1회성 처리
    try {
      sessionStorage.removeItem("returnToSelect");
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("select") === "1") {
        sp.delete("select");
        const next = sp.toString();
        routerRef.current.replace(next ? `/?${next}` : "/");
      }
    } catch {}

    const v = videoRef.current;
    if (!v) return;

    // BG가 아니고 MAIN 비디오가 준비되어 있지 않다면, 최소한 src를 MAIN으로 바꿔놓고 로드
    // (893f에서 정지 상태만 필요하므로 autoplay/오디오 트리거는 요구하지 않음)
    try {
      v.src = "/videos/intro_v6.mp4";
      v.loop = false;
      v.muted = true;
      v.load();
    } catch {}

    // 메타데이터만 오면 바로 점프
    const onMeta = () => {
      try {
        v.removeEventListener("loadedmetadata", onMeta);
      } catch {}

      setStageSafe("MAIN");
      setPhaseSafe("PLAY5");
      setHoverZone(null);

      try {
        v.pause();
        v.currentTime = f2s(PLAY5.end); // 893f
      } catch {}

      setShowSelectImg(true);
      showSelectImgRef.current = true;

      // hover 루프를 위해 muted는 유지 (원하면 여기서 false로 바꿔도 됨)
    };

    try {
      v.addEventListener("loadedmetadata", onMeta);
    } catch {}

    // 이미 메타가 있는 경우 즉시 실행
    if (Number.isFinite(v.duration) && v.duration > 0) {
      onMeta();
    }

    return () => {
      try {
        v.removeEventListener("loadedmetadata", onMeta);
      } catch {}
    };
  }, []);

  // ✅ 선택 화면에서 클릭 줌인 재생 중인지
  const [isZooming, setIsZooming] = useState(false);
  // ✅ 라우팅 직전 버튼 플래시 방지용
  const [isRouting, setIsRouting] = useState(false);
  const isRoutingRef = useRef(false);

  useEffect(() => {
    isRoutingRef.current = isRouting;
  }, [isRouting]);

  const isZoomingRef = useRef(false);
  const zoomSegRef = useRef<{ start: number; end: number; path: string } | null>(null);


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

  // ✅ 엔드(셀렉트) 오버레이 상태
  const [showSelectImg, setShowSelectImg] = useState(false);
  const showSelectImgRef = useRef(false);

  // showSelectImg state ↔ ref 동기화 (호버/클릭 가드용)
  useEffect(() => {
    showSelectImgRef.current = showSelectImg;
  }, [showSelectImg]);


  // ✅ 3분할 호버 상태 (셀렉트 단계에서만 사용)
  const [hoverZone, setHoverZone] = useState<HoverZone>(null);
  const hoverZoneRef = useRef<HoverZone>(null);

  // hoverZone state와 ref 동기화
  useEffect(() => {
    hoverZoneRef.current = hoverZone;
  }, [hoverZone]);

  // ✅ SKIP 전환(암전) 상태
  const [isSkipFading, setIsSkipFading] = useState(false);
  const skipLockRef = useRef(false);

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

    // 다른 페이즈로 이동하면(=리플레이 등) 셀렉트/호버 상태 초기화
    if (p !== "PLAY5") {
      setHoverZone(null);
      setShowSelectImg(false);
    }
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

      // ✅ UA/카테고리 페이지에서 BACK으로 돌아온 경우:
      // 프리로딩(BG01/오디오)을 다시 돌리지 말고 즉시 893f 셀렉트 화면으로 점프한다.
      let wantSelect = false;
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("select") === "1") wantSelect = true;
        if (sessionStorage.getItem("returnToSelect") === "1") wantSelect = true;
      } catch {}

      if (wantSelect) {
        // 1회성 처리
        try {
          sessionStorage.removeItem("returnToSelect");
          const sp = new URLSearchParams(window.location.search);
          if (sp.get("select") === "1") {
            sp.delete("select");
            const next = sp.toString();
            routerRef.current.replace(next ? `/?${next}` : "/");
          }
        } catch {}

        setIsSkipFading(true);

        // 암전이 덮일 시간을 아주 잠깐 확보
        await new Promise((r) => setTimeout(r, 180));

        // 상태를 'MAIN + 셀렉트(PLAY5 end=893f)'로 고정
        if (!cancelled) {
          setBootProgress(100);
          setBootLoading(false);
        }

        setStageSafe("MAIN");
        setPhaseSafe("PLAY5");
        setHoverZone(null);

        // 줌인/라우팅/페이드 등 잠금 상태도 전부 해제
        isZoomingRef.current = false;
        setIsZooming(false);
        zoomSegRef.current = null;

        isRoutingRef.current = false;
        setIsRouting(false);

        // setIsSkipFading(false); // ✅ onMeta에서 페이드인 처리
        skipLockRef.current = false;

        // 비디오를 intro로 바꾸고 893f로 점프
        try {
          v.src = "/videos/intro_v6.mp4";
          v.loop = false;
          v.muted = true;
          v.load();
        } catch {}

        const onMeta = () => {
          try {
            v.removeEventListener("loadedmetadata", onMeta);
          } catch {}

          try {
            v.pause();
            v.currentTime = f2s(PLAY5.end); // 893f
          } catch {}

          setShowSelectImg(true);
          showSelectImgRef.current = true;

          // ✅ 893f가 세팅된 다음 페이드인
          requestAnimationFrame(() => {
            if (!cancelled) setIsSkipFading(false);
          });
        };

        try {
          v.addEventListener("loadedmetadata", onMeta);
        } catch {}

        if (Number.isFinite(v.duration) && v.duration > 0) onMeta();

        return; // 🔴 프리로딩 루틴(BG01/오디오) 실행 금지
      }


      // ✅ 시작하자마자 0%에서 멈춘 것처럼 보이지 않게 "미리" 진행률을 조금 올림
      if (!cancelled) setBootProgress(1);

      // BG 메타데이터까지만 준비 (모바일 안정)
      v.src = "/videos/BG01.mp4";
      v.loop = true;
      v.muted = true;
      v.currentTime = 0;
      v.load(); // 모바일에서 이벤트 안 뜨는 것 방지

      // 메타데이터가 늦어질 때는 30%까지 "천천히" 올라가게 표시(실제 로딩을 막지는 않음)
      let fakePct = 1;
      const fakeTimer = window.setInterval(() => {
        fakePct = Math.min(30, fakePct + 1);
        if (!cancelled) setBootProgress((p) => (p < fakePct ? fakePct : p));
      }, 40);

      const waitBGReady = new Promise<void>((resolve) => {
        const onReady = () => {
          v.removeEventListener("loadedmetadata", onReady);
          resolve();
        };
        v.addEventListener("loadedmetadata", onReady);
      });

      // 🔑 모바일에서는 큰 mp4 프리로드 안 함 (오디오만)
      const assets = ["/videos/BGM_LOOP.wav", "/videos/BGM_ENTER.mp3"];

      // ⏱️ 4초 타임아웃 (어떤 경우든 멈추지 않게)
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));

      await Promise.race([waitBGReady, timeout]);

      window.clearInterval(fakeTimer);
      if (!cancelled) setBootProgress((p) => (p < 40 ? 40 : p));

      // 오디오/리소스는 "단계별"로 진행률 반영 (캐시가 있으면 빠르게 100까지 올라감)
      for (let i = 0; i < assets.length; i++) {
        const url = assets[i];
        try {
          await fetch(url, { cache: "force-cache" });
        } catch {}
        const pct = i === 0 ? 70 : 100;
        if (!cancelled) setBootProgress((p) => (p < pct ? pct : p));
      }

      if (!cancelled) {
        setBootLoading(false);
        v.play().catch(() => {});
      }
    } catch {
      if (!cancelled) {
        // 실패해도 화면은 열어준다
        setBootLoading(false);
      }
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
        // ✅ 클릭 줌인 재생이 최우선 (셀렉트/호버/893f 고정보다 먼저 처리)
        if (isZoomingRef.current && zoomSegRef.current) {
                    const seg = zoomSegRef.current;
                    const startT = f2s(seg.start);
                    const endT = endEx(seg.end);

                    // 안전: 시작보다 앞이면 시작으로 당김
                    if (v.currentTime < startT - 0.0005) {
                      const anyV: any = v;
                      try {
                        if (typeof anyV.fastSeek === "function") anyV.fastSeek(startT);
                        else v.currentTime = startT;
                      } catch {
                        v.currentTime = startT;
                      }
                    }

                    if (v.paused) v.play().catch(() => {});

                    // ✅ intro_v6가 구간 끝에서 file-end로 떨어지면(특히 AI) currentTime이 0으로 튈 수 있음
                    // endT가 duration을 넘는 경우, "실제 영상 끝"을 종료로 인정
                    const dur = v.duration;
                    const hasDur = Number.isFinite(dur) && dur > 0;
                    const effectiveEndT = hasDur ? Math.min(endT, Math.max(0, dur - 0.02)) : endT;

                    let routed = false;

                    if (v.currentTime >= effectiveEndT || (v.ended && v.currentTime >= startT)) {
                      // 끝 도달(또는 파일 끝) → 정지 후 라우팅
                      try {
                        v.pause();
                      } catch {}
                      const path = seg.path;

                      // 상태 정리(중복 이동 방지)
                      isZoomingRef.current = false;
                      setIsZooming(false);
                      zoomSegRef.current = null;
                      setHoverZone(null);
                      setShowSelectImg(false);
                      showSelectImgRef.current = false;

                      // 다음 페이지 이동
                      isRoutingRef.current = true;
          setIsRouting(true);
          routerRef.current.push(path);
                      routed = true;
                    }

                    if (routed) return;

                    raf = requestAnimationFrame(tick);
                    return;
                  }

        // ✅ 셀렉트(엔드) 모드: 893f 고정 + 3분할 호버 루프
        if (showSelectImgRef.current) {

          const hz = hoverZoneRef.current;

          const seg =
            hz === "LEFT" ? HOVER_L : hz === "CENTER" ? HOVER_C : hz === "RIGHT" ? HOVER_R : null;

          if (!seg) {
            // 호버 없음 → 893f 고정 (영상 정지)
            if (!v.paused) v.pause();
            // 외부 요인으로 시간이 흘렀을 수 있으니 주기적으로 다시 고정
            if (Math.abs(v.currentTime - f2s(PLAY5.end)) > 0.0005) {
              v.currentTime = f2s(PLAY5.end);
            }
          } else {
            // 호버 중 → 해당 구간 루프
            const startT = f2s(seg.start);
            const endT = endEx(seg.end);
            const LOOP_EPS = 0.75 / FPS; // ~0.75프레임 일찍 되감기(멈칫 감소)
            if (t < startT || t >= endT - LOOP_EPS) {
              const anyV: any = v;
              try {
                if (typeof anyV.fastSeek === "function") anyV.fastSeek(startT);
                else v.currentTime = startT;
              } catch {
                v.currentTime = startT;
              }
            }
            if (v.paused) {
              v.play().catch(() => {});
            }
          }

          raf = requestAnimationFrame(tick);
          return;
        }

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
            // ✅ PLAY5 끝에서 영상 정지 + 셀렉트 이미지 디졸브
            v.pause();
            v.currentTime = f2s(PLAY5.end);
            setShowSelectImg(true);
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
    setHoverZone(null);
    setShowSelectImg(false);
    setPhaseSafe("PLAY1");

    v.src = "/videos/intro_v6.mp4";
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


// ✅ SKIP: 암전 → 음악 페이드아웃 종료 → 893f 고정 + 셀렉트 UI 진입 → 페이드인
const handleSkipToSelect = async () => {
  if (skipLockRef.current) return;
  skipLockRef.current = true;

  const v = videoRef.current;
  if (!v) {
    skipLockRef.current = false;
    return;
  }

  // 1) 화면 암전 시작
  setIsSkipFading(true);

  // 2) 현재 재생 중인 음악(루프/엔터)을 페이드아웃하며 종료
  // - LOOP 음악(WebAudio)
  try {
    stopLoopAfterFade(0.35);
  } catch {}

  // - ENTER 음악(HTMLAudio)
  const enter = bgmEnterRef.current;
  if (enter && !enter.paused) {
    const from = enter.volume ?? 1;
    fadeVolume(enter, from, 0, 0.35);
    setTimeout(() => {
      try {
        enter.pause();
        enter.currentTime = 0;
        enter.volume = 1;
      } catch {}
    }, 380);
  }

  // 3) 암전이 충분히 덮일 때까지 잠깐 대기
  await new Promise((r) => setTimeout(r, 260));

  // 4) PLAY5 마지막 프레임(893f)으로 고정 + 셀렉트 UI 오버레이
  setPhaseSafe("PLAY5");
  setHoverZone(null);
  v.pause();
  v.currentTime = f2s(PLAY5.end);
  setShowSelectImg(true);

  // 5) 페이드 인
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  setIsSkipFading(false);

  // 6) 연타 방지 해제
  setTimeout(() => {
    skipLockRef.current = false;
  }, 350);
};

  // ✅ REPLAY: 첫 화면 ENTER과 동일하게 처음부터 다시 실행
  const handleReplay = async () => {
    setHoverZone(null);
    setShowSelectImg(false);
    setIsSkipFading(false);
    skipLockRef.current = false;
    await handleStartMain();
  };
  // ✅ 셀렉트 상태 호버: 구간 즉시 전환(디졸브 없음)
  const setHoverZoneImmediate = (next: HoverZone) => {
    if (!showSelectImgRef.current) return;
    // ✅ 클릭 줌인 재생 중에는 hover 이벤트가 currentTime을 건드리지 못하게 차단
    if (isZoomingRef.current) return;

    const prev = hoverZoneRef.current;
    if (prev === next) return;

    setHoverZone(next);

    const v = videoRef.current;
    if (!v) return;

    if (!next) {
      v.pause();
      v.currentTime = f2s(PLAY5.end); // 893f 고정
      return;
    }

    const seg = next === "LEFT" ? HOVER_L : next === "CENTER" ? HOVER_C : HOVER_R;
    // hover 전환은 즉시지만, seek 직후 바로 play하면 간혹 1~2프레임 어긋나 보일 수 있어 1프레임 뒤 재생
    v.pause();
    v.currentTime = f2s(seg.start);
    requestAnimationFrame(() => v.play().catch(() => {}));
  };

  
// 클릭 핸들러: 줌인 구간 재생 후 라우팅
const handleSelectClick = async (z: Exclude<HoverZone, null>) => {
  if (!showSelectImgRef.current) return;
  if (isZoomingRef.current) return;

  const v = videoRef.current;
  if (!v) return;

  const seg = z === "LEFT" ? CLICK_UA : z === "CENTER" ? CLICK_BRANDED : CLICK_AI;

  // 줌인 재생 모드 ON (호버 루프는 잠시 무시)
  isZoomingRef.current = true;
  setIsZooming(true);
  // 라우팅 플래그 초기화
  isRoutingRef.current = false;
  setIsRouting(false);
  zoomSegRef.current = seg;

  // ✅ 클릭 시작 순간부터: 호버/893f 고정 로직이 currentTime을 건드리지 못하게 정리
  setHoverZone(null);
  // ⚠️ 셀렉트 이미지는 "seek 완료 후" 숨긴다 (893f 프레임이 잠깐 노출되는 플래시 방지)

  // ✅ 시작 프레임으로 "확실히" 이동한 뒤 재생 (seeked 대기)
  try {
    v.pause();
  } catch {}
  const startT = f2s(seg.start);
  await seekTo(v, startT);

  // 일부 브라우저는 seek 직후 첫 틱에서 한 프레임 이전을 잠깐 보여줄 수 있어
  // play 전에 한번 더 당겨줌(극미세)
  if (v.currentTime < startT - 0.0005) {
    try {
      v.currentTime = startT;
    } catch {}
  }

  // ✅ seek이 끝나고 start 프레임에 붙은 뒤에 셀렉트 오버레이를 숨긴다 (플래시 방지)
  setShowSelectImg(false);
  showSelectImgRef.current = false;

  v.play().catch(() => {});
};




  return (
    <main className="fixed inset-0 bg-black overflow-hidden"><div ref={containerRef} className="absolute inset-0">
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


      {/* ✅ PLAY5 종료 후 셀렉트 이미지 오버레이 */}
      <img
        src="/images/select_img.jpg"
        alt="select"
        className={[
          "absolute inset-0 w-full h-full object-contain bg-black",
                    showSelectImg ? "opacity-100" : "opacity-0",
          hoverZone ? "invisible" : "visible",
          "pointer-events-none",
        ].join(" ")}
        draggable={false}
      />

      {/* ✅ 셀렉트 3분할 핫스팟 (세로 3등분) */}
      {stage === "MAIN" && showSelectImg && !isRouting && (
        <div
          className={["absolute inset-0 z-30 flex", isZooming ? "pointer-events-none" : ""].join(" ")}
          onMouseLeave={() => setHoverZoneImmediate(null)}
        >
          <div
            className="flex-1 cursor-pointer"
            onMouseEnter={() => setHoverZoneImmediate("LEFT")}
            onClick={() => handleSelectClick("LEFT")}
          />
          <div
            className="flex-1 cursor-pointer"
            onMouseEnter={() => setHoverZoneImmediate("CENTER")}
            onClick={() => handleSelectClick("CENTER")}
          />
          <div
            className="flex-1 cursor-pointer"
            onMouseEnter={() => setHoverZoneImmediate("RIGHT")}
            onClick={() => handleSelectClick("RIGHT")}
          />
        </div>
      )}


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
            className="px-10 py-3 border border-white/70 rounded-full tracking-widest hover:bg-white hover:text-black transition cursor-pointer"
          >
            ENTER
          </button>
        </div>
      )}

      {/* LOOP2: ↓ 버튼 */}
      {stage === "MAIN" && showDown && (
        <button
          onClick={handleDownToPlay3}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 border border-white/70 rounded-full text-white hover:bg-white hover:text-black transition whitespace-nowrap cursor-pointer"
        >
          문앞으로 이동
        </button>
      )}

      {/* LOOP4: ENTER 버튼 */}
      {stage === "MAIN" && showEnterBtn && (
        <button
          onClick={handleEnterToPlay5}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-3 border border-white/70 rounded-full tracking-widest text-white hover:bg-white hover:text-black transition cursor-pointer"
        >
          입장
        </button>
      )}



{/* ✅ SKIP 버튼 (암전 후 선택 화면으로) */}
{stage === "MAIN" && !showSelectImg && !isZooming && !isRouting && (
  <button
    onClick={handleSkipToSelect}
    disabled={isSkipFading}
    className={[
      "absolute bottom-6 right-6 z-40 px-5 py-2 rounded-full cursor-pointer",
      "border border-white/20 bg-black/35 backdrop-blur-md text-white tracking-widest text-sm",
      "hover:bg-white hover:text-black transition",
      isSkipFading ? "opacity-50 cursor-not-allowed" : "",
    ].join(" ")}
  >
    SKIP
  </button>
)}

{/* ✅ REPLAY 버튼 (셀렉트 상태에서 SKIP 자리 대체) */}
{stage === "MAIN" && showSelectImg && !isRouting && (
  <button
    onClick={handleReplay}
    disabled={isSkipFading}
    className={[
      "absolute bottom-6 right-6 z-40 px-5 py-2 rounded-full cursor-pointer",
      "border border-white/20 bg-black/35 backdrop-blur-md text-white tracking-widest text-sm",
      "hover:bg-white hover:text-black transition",
      isSkipFading ? "opacity-50 cursor-not-allowed" : "",
    ].join(" ")}
  >
    REPLAY
  </button>
)}

      {/* ✅ SKIP 페이드(암전) 오버레이 */}
<div
  className={[
    "absolute inset-0 z-[80] bg-black pointer-events-none",
    "transition-opacity duration-300",
    isSkipFading ? "opacity-100" : "opacity-0",
  ].join(" ")}
/>

    </div>
    </main>
  );
}
