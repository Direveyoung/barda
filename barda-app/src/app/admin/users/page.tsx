"use client";

import { useEffect, useState } from "react";
import { PageHeader, EmptyDBState, TableSkeleton, StatusBadge } from "@/components/admin/shared";

interface AdminUser {
  user_id: string;
  nickname: string;
  skin_type: string;
  concerns: string[];
  onboarding_complete: boolean;
  balance?: number;
  created_at?: string;
}

const SKIN_TYPE_LABEL: Record<string, string> = {
  oily: "지성", dry: "건성", combination: "복합성", sensitive: "민감성", normal: "중성",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 503) { setDbAvailable(false); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data) setUsers(data.users ?? []); })
      .catch(() => setDbAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  if (!dbAvailable) {
    return (
      <div>
        <PageHeader title="회원 관리" description="사용자 프로필 및 활동" />
        <EmptyDBState label="DB 연결 시 사용 가능" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="회원 관리" description={loading ? "로딩 중..." : `총 ${users.length}명`} />

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">닉네임</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">피부타입</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">고민</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">포인트</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">온보딩</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-800 font-medium">{u.nickname || "-"}</td>
                    <td className="py-2.5 px-3 text-gray-600">{SKIN_TYPE_LABEL[u.skin_type] ?? u.skin_type ?? "-"}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.concerns ?? []).slice(0, 3).map((c) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{u.balance ?? 0}P</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={u.onboarding_complete ? "enabled" : "disabled"} label={u.onboarding_complete ? "완료" : "미완"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">등록된 회원이 없습니다</p>
        )}
      </div>
    </div>
  );
}
