"use client";

const SKIN_TYPES = [
  { id: "normal", label: "보통", emoji: "😊", desc: "특별한 트러블 없는 편" },
  { id: "dry", label: "건성", emoji: "🏜️", desc: "당김·각질이 자주 생겨요" },
  { id: "oily", label: "지성", emoji: "💧", desc: "유분·번들거림이 많아요" },
  { id: "combination", label: "복합", emoji: "🔄", desc: "T존은 지성, 볼은 건성" },
  { id: "sensitive", label: "민감", emoji: "🌡️", desc: "자극에 쉽게 반응해요" },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export default function SkinTypeStep({ selected, onSelect, onNext }: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        피부 타입을 알려주세요
      </h2>
      <p className="text-gray-500 mb-6">맞춤 분석을 위한 첫 단계예요</p>

      <div className="grid grid-cols-1 gap-3">
        {SKIN_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              selected === type.id
                ? "border-primary bg-primary-bg shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-3xl">{type.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800">{type.label}</div>
              <div className="text-sm text-gray-500">{type.desc}</div>
            </div>
            {selected === type.id && (
              <span className="ml-auto text-primary font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="mt-6 w-full py-3.5 rounded-2xl font-semibold text-white bg-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
      >
        다음으로
      </button>
    </div>
  );
}
