"use client";

import { useState } from "react";

interface ShareRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  skinType: string;
  concerns: string[];
  score: number;
  products: Array<{
    id: string;
    brand: string;
    name: string;
    categoryId: string;
  }>;
}

export default function ShareRoutineModal({
  isOpen,
  onClose,
  skinType,
  concerns,
  score,
  products,
}: ShareRoutineModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (rating === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skin_type: skinType,
          concerns,
          score,
          rating,
          comment: comment.trim() || null,
          products_json: products,
        }),
      });

      if (!res.ok) throw new Error("Failed to share routine");

      setRating(0);
      setComment("");
      onClose();
    } catch (err) {
      console.error("Share routine error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">내 루틴 공유하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Star rating */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">
            루틴 만족도
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className="transition-transform active:scale-90"
              >
                <svg
                  className={`w-8 h-8 ${
                    i <= rating ? "text-am-deep" : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Comment textarea */}
        <div className="mb-5">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="내 루틴에 대한 한마디..."
            maxLength={300}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              공유 중...
            </span>
          ) : (
            "공유하기"
          )}
        </button>
      </div>
    </div>
  );
}
