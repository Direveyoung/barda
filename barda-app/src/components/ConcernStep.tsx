"use client";

const CONCERNS = [
  { id: "acne", label: "여드름·트러블", emoji: "🔴" },
  { id: "pigment", label: "잡티·색소침착", emoji: "🟤" },
  { id: "wrinkle", label: "주름·탄력", emoji: "〰️" },
  { id: "pore", label: "모공", emoji: "🔵" },
  { id: "dryness", label: "건조·수분부족", emoji: "🏜️" },
  { id: "redness", label: "홍조·민감", emoji: "🌡️" },
  { id: "dullness", label: "칙칙함·톤업", emoji: "✨" },
  { id: "blackhead", label: "블랙헤드·피지", emoji: "⚫" },
];

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ConcernStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        피부 고민을 선택해 주세요
      </h2>
      <p className="text-gray-500 mb-6">여러 개 선택할 수 있어요 (최대 3개)</p>

      <div className="grid grid-cols-2 gap-3">
        {CONCERNS.map((concern) => {
          const isSelected = selected.includes(concern.id);
          const isDisabled = !isSelected && selected.length >= 3;

          return (
            <button
              key={concern.id}
              onClick={() => !isDisabled && onToggle(concern.id)}
              disabled={isDisabled}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary-bg shadow-sm"
                  : isDisabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-xl">{concern.emoji}</span>
              <span
                className={`text-sm font-medium ${isSelected ? "text-primary" : "text-gray-700"}`}
              >
                {concern.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors"
        >
          다음으로
        </button>
      </div>
    </div>
  );
}
