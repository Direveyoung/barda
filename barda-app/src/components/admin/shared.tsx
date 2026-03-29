"use client";

import { useState, useMemo, type ReactNode } from "react";
import Icon from "@/components/Icon";

/* ─── InMemoryBanner ─── */

export function InMemoryBanner({ label }: { label?: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
      <Icon name="burst" size={14} />
      <span className="text-xs text-amber-700">
        {label ?? "인메모리 데이터 (읽기 전용) — DB 연동 시 편집 가능"}
      </span>
    </div>
  );
}

/* ─── EmptyDBState ─── */

export function EmptyDBState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon name="package" size={36} />
      <p className="text-sm font-medium mt-2">{label ?? "DB 연결 시 사용 가능"}</p>
      <p className="text-xs text-gray-300 mt-1">Supabase 연동 후 데이터가 표시됩니다</p>
    </div>
  );
}

/* ─── StatusBadge ─── */

const BADGE_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  auto_promoted: "bg-blue-100 text-blue-700",
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
  warning: "bg-amber-100 text-amber-700",
  enabled: "bg-green-100 text-green-700",
  disabled: "bg-gray-100 text-gray-400",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label ?? status}
    </span>
  );
}

/* ─── StatCard ─── */

export function StatCard({
  label, value, format, subtitle,
}: {
  label: string;
  value: number;
  format?: "number" | "currency" | "percent";
  subtitle?: string;
}) {
  const display =
    format === "currency"
      ? `${value.toLocaleString("ko-KR")}원`
      : format === "percent"
        ? `${value}%`
        : value.toLocaleString("ko-KR");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{display}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ─── SearchInput ─── */

export function SearchInput({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon name="sparkle" size={14} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "검색..."}
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 bg-white"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Skeleton ─── */

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-28 bg-gray-200 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 flex-1 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ─── PageHeader ─── */

export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

/* ─── DataTable ─── */

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render: (item: T) => ReactNode;
  sortValue?: (item: T) => string | number;
}

export function DataTable<T extends { id?: string }>({
  data, columns, pageSize = 20, emptyMessage,
}: {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
}) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const fn = col.sortValue;
    return [...data].sort((a, b) => {
      const av = fn(a);
      const bv = fn(b);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortAsc, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(0);
  };

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        {emptyMessage ?? "데이터가 없습니다"}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortValue && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-primary">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={(item as Record<string, unknown>).id as string ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="py-2.5 px-3">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            총 {sorted.length}개 중 {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-xs text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
