"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string;
  onComplete: () => void;
}

function calculateTimeLeft(endDate: string) {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
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

  const formattedDate = new Date(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const segments = [
    { value: pad(timeLeft.days), label: "D" },
    { value: pad(timeLeft.hours), label: "H" },
    { value: pad(timeLeft.minutes), label: "M" },
    { value: pad(timeLeft.seconds), label: "S" },
  ];

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <div className="flex items-center gap-1">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-white bg-[#F7311E] py-[3px] px-[7px] rounded-md font-mono">
              {seg.value}
            </span>
            {idx < segments.length - 1 && <span className="text-gray-400">:</span>}
          </div>
        ))}
      </div>
      <span className="text-gray-500 text-[11px]">ends {formattedDate}</span>
    </div>
  );
};

export default CountdownTimer;
