import Link from "next/link";
import Icon from "@/components/Icon";
import BottomNav from "@/components/BottomNav";

export default function NotFound() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 pb-20">
        <div className="max-w-sm w-full text-center">
          <div className="mb-4 text-gray-300">
            <Icon name="search" size={48} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            페이지를 찾을 수 없어요
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            요청하신 페이지가 존재하지 않거나
            <br />
            주소가 변경되었을 수 있습니다.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors text-sm"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/analyze"
              className="px-6 py-2.5 rounded-2xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              루틴 분석하기
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
