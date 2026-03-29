"use client";

import { useCallback, useEffect, useState } from "react";
import { INGREDIENT_DB } from "@/data/ingredients";
import type { IngredientSensitivity } from "@/lib/user-data-repository";
import { saveSensitivity, loadSensitivities, deleteSensitivity } from "@/lib/user-data-repository";
import Icon from "@/components/Icon";

const SEVERITY_OPTIONS: { value: IngredientSensitivity["severity"]; label: string; color: string }[] = [
  { value: "mild",     label: "경미",  color: "bg-fuchsia-100 text-fuchsia-700" },
  { value: "moderate", label: "주의",  color: "bg-pink-100 text-pink-700" },
  { value: "severe",   label: "심각",  color: "bg-rose-100 text-rose-700" },
];

const ingredientNames = Object.values(INGREDIENT_DB).map((i) => i.name);

export default function SensitivityManager({ userId }: { userId: string }) {
  const [items, setItems] = useState<IngredientSensitivity[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<IngredientSensitivity["severity"]>("moderate");
  const [note, setNote] = useState("");

  useEffect(() => {
    loadSensitivities(userId).then(setItems);
  }, [userId]);

  const filtered = search.trim()
    ? ingredientNames.filter((n) =>
        n.includes(search.trim()) && !items.some((i) => i.ingredientName === n)
      )
    : [];

  const handleAdd = useCallback(async (name: string) => {
    const sens: IngredientSensitivity = {
      ingredientName: name,
      severity,
      reactionNote: note.trim() || undefined,
    };
    await saveSensitivity(userId, sens);
    setItems((prev) => [...prev.filter((i) => i.ingredientName !== name), sens]);
    setSearch("");
    setNote("");
    setIsAdding(false);
  }, [userId, severity, note]);

  const handleDelete = useCallback(async (name: string) => {
    await deleteSensitivity(userId, name);
    setItems((prev) => prev.filter((i) => i.ingredientName !== name));
  }, [userId]);

  return (
    <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100">
      <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-1.5">
        <Icon name="alert" size={14} /> 민감 성분 등록
      </h3>
      <p className="text-xs text-rose-500 mb-3">
        등록한 성분이 포함된 제품으로 분석 시 자동으로 경고합니다.
      </p>

      {/* Registered sensitivities */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item) => {
            const opt = SEVERITY_OPTIONS.find((o) => o.value === item.severity);
            return (
              <div key={item.ingredientName} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${opt?.color ?? ""}`}>
                  {opt?.label}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800">{item.ingredientName}</span>
                {item.reactionNote && (
                  <span className="text-xs text-gray-400 truncate max-w-[80px]">{item.reactionNote}</span>
                )}
                <button
                  onClick={() => handleDelete(item.ingredientName)}
                  className="text-gray-300 hover:text-rose-500 transition-colors"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {isAdding ? (
        <div className="space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="성분 이름 검색 (예: 레티놀)"
            className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {filtered.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
              {filtered.slice(0, 8).map((name) => (
                <button
                  key={name}
                  onClick={() => { setSearch(name); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSeverity(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  severity === opt.value ? opt.color + " ring-2 ring-offset-1 ring-rose-300" : "bg-gray-100 text-gray-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="반응 메모 (선택)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { if (search.trim()) handleAdd(search.trim()); }}
              disabled={!search.trim()}
              className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-rose-600 transition-colors"
            >
              등록
            </button>
            <button
              onClick={() => { setIsAdding(false); setSearch(""); setNote(""); }}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-rose-200 text-rose-500 text-sm font-semibold hover:bg-rose-50 transition-colors"
        >
          + 민감 성분 추가
        </button>
      )}
    </div>
  );
}
