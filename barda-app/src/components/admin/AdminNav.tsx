"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "대시보드",
    items: [
      { href: "/admin", label: "개요", icon: "chart" },
    ],
  },
  {
    title: "콘텐츠 DB",
    items: [
      { href: "/admin/products", label: "제품 관리", icon: "bottle" },
      { href: "/admin/candidates", label: "제품 후보", icon: "package" },
      { href: "/admin/ingredients", label: "성분 DB", icon: "beaker" },
      { href: "/admin/rules", label: "충돌 규칙", icon: "shield" },
      { href: "/admin/brands", label: "브랜드 티어", icon: "sparkle" },
      { href: "/admin/challenges", label: "챌린지", icon: "trophy" },
    ],
  },
  {
    title: "사용자",
    items: [
      { href: "/admin/users", label: "회원 관리", icon: "face-happy" },
      { href: "/admin/points", label: "포인트", icon: "orange" },
    ],
  },
  {
    title: "커뮤니티",
    items: [
      { href: "/admin/community", label: "게시글 관리", icon: "bubble" },
    ],
  },
  {
    title: "시스템",
    items: [
      { href: "/admin/pipeline", label: "파이프라인", icon: "target" },
      { href: "/admin/api-health", label: "외부 API", icon: "burst" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] py-4 hidden lg:block">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mb-4">
          <p className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {group.title}
          </p>
          {group.items.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-primary bg-primary-bg font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Mobile bottom sheet style nav for small screens */
export function AdminMobileNav() {
  const pathname = usePathname();

  const allItems = NAV_GROUPS.flatMap((g) => g.items);

  return (
    <div className="lg:hidden sticky top-[57px] z-10 bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-1 px-4 py-2">
        {allItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Icon name={item.icon} size={12} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
