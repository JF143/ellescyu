"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";

type LoadingScreenProps = {
  durationMs?: number;
};

const STATUS_MESSAGES = [
  "Preparing products",
  "Syncing database",
  "Checking for errors",
  "Waking up Pochaco",
  "Warming up the kiosk",
  "Counting the pesos",
  "Dusting the shelves",
  "Pochaco is dancing",
  "Restocking shelves",
  "Checking the sales",
];

const READY_MESSAGE = "ELLESCYU READY!";

export function LoadingScreen({ durationMs = 3000 }: LoadingScreenProps) {
  const { setAppReady } = useCart();
  const [progress, setProgress] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const [pulseOn, setPulseOn] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0]);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const isComplete = progress >= 100;

  // Hide the Order Details panel while the loading screen is up,
  // and bring it back once loading finishes.
  useEffect(() => {
    setAppReady(false);
    return () => setAppReady(true);
  }, [setAppReady]);

  // Deterministic progress bar — reaches exactly 100% at durationMs, regardless of network speed
  useEffect(() => {
    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const nextProgress = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [durationMs]);

  // "Loading..." dots — loops 1, 2, 3
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseOn((prev) => !prev);
    }, 3000);
    return () => clearInterval(pulseInterval);
  }, []);

  // Randomly rotate through status messages until loading completes
  useEffect(() => {
    if (isComplete) return;
    const messageInterval = setInterval(() => {
      setStatusMessage((prev) => {
        let next = prev;
        while (next === prev) {
          next = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
        }
        return next;
      });
    }, 900);
    return () => clearInterval(messageInterval);
  }, [isComplete]);

  const displayLabel = isComplete
    ? READY_MESSAGE
    : `${statusMessage}${".".repeat(dotCount)}`;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f9f9ff]">
      {/* Ambient pulse background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[#0058be]/5 transition-opacity duration-[3000ms] ease-in-out"
          style={{ opacity: pulseOn ? 1 : 0 }}
        />
      </div>

      {/* Central focus container */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
        <div className="group relative">
          <div className="absolute inset-0 scale-75 rounded-full bg-[#0058be]/20 blur-3xl transition-transform duration-1000 group-hover:scale-90" />
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden">
            {imageError ? (
              <span className="text-5xl">🐶</span>
            ) : (
              <img
                src="/loading screen.gif"
                alt="Loading"
                onError={() => setImageError(true)}
                className="h-full w-full object-contain mix-blend-multiply opacity-90"
              />
            )}
          </div>
        </div>

        <div className="-mt-4 flex w-full flex-col items-center space-y-6">
          <h1 className="text-2xl font-medium text-[#424754]">
            Loading{".".repeat(dotCount)}
          </h1>

          <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#e7eeff]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#0058be] shadow-[0_0_8px_rgba(0,88,190,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex w-full justify-between text-xs font-medium text-[#424754]/60">
            <span>{Math.round(progress)}%</span>
            <span className="uppercase tracking-wider">{displayLabel}</span>
          </div>
        </div>
      </div>

      {/* Brand wordmark */}
      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 select-none items-center gap-3 opacity-30">
        <div className="h-px w-8 bg-[#424754]" />
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#424754]">
          Ellescyu
        </span>
        <div className="h-px w-8 bg-[#424754]" />
      </div>
    </div>
  );
}