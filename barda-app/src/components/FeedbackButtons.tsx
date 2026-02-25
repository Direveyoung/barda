"use client";

import { useState } from "react";
import { getSessionId, trackEvent } from "@/lib/events";
import Icon from "@/components/Icon";

interface Props {
  conflictId: string;
}

export default function FeedbackButtons({ conflictId }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(isHelpful: boolean) {
    if (submitted || loading) return;
    setLoading(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conflict_rule_id: conflictId,
          is_helpful: isHelpful,
          session_id: getSessionId(),
        }),
      });

      trackEvent("feedback_submitted", {
        conflict_rule_id: conflictId,
        is_helpful: isHelpful,
      });

      setSubmitted(true);
    } catch {
      // Silently ignore — feedback is non-critical
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <span className="text-xs text-gray-500 select-none">
        감사합니다!
      </span>
    );
  }

  return (
    <span className="inline-flex gap-1 items-center">
      <button
        onClick={() => handleFeedback(true)}
        disabled={loading}
        aria-label="도움이 되었어요"
        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm leading-none"
      >
        <Icon name="thumbs-up" size={16} />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={loading}
        aria-label="도움이 안 되었어요"
        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm leading-none"
      >
        <Icon name="thumbs-down" size={16} />
      </button>
    </span>
  );
}
