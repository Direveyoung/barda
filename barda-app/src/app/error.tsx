"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BARDA Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-4 text-primary">
          <Icon name="warning" size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          문제가 발생했어요
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors text-sm"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-2xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
