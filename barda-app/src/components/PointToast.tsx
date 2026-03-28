"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface PointToastProps {
  points: number;
  label?: string;
  onDismiss: () => void;
}

export default function PointToast({ points, label, onDismiss }: PointToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
        <Icon name="sparkle" size={16} />
        <span className="text-sm font-bold">+{points}P</span>
        {label && <span className="text-xs opacity-80">{label}</span>}
      </div>
    </div>
  );
}
