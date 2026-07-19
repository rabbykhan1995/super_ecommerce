"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string;
  onComplete: () => void;
}

function calculateTimeLeft(endDate: string) {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const CountdownTimer = ({ endDate, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft(endDate);
      setTimeLeft(updated);
      if (updated.expired) {
        clearInterval(timer);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-1 text-[12px]">
      {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map(
        (val, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-white bg-[#F7311E] py-[3px] px-[7px] rounded-md font-mono">
              {val}
            </span>
            {idx < 2 && <span className="text-gray-400">:</span>}
          </div>
        )
      )}
    </div>
  );
};

export default CountdownTimer;
