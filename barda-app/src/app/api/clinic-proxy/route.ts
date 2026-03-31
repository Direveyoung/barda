export const runtime = "edge";

export async function GET() {
  try {
    const res = await fetch("https://clinic-list.vercel.app/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });

    let html = await res.text();
    const base = "https://clinic-list.vercel.app";

    // split/join으로 상대 경로 절대 URL  ubcc0환
    html = html.split('src="/_next/').join('src="' + base + '/_next/');
    html = html.split('href="/_next/').join('href="' + base + '/_next/');
    html = html.split("src='/_next/").join("src='" + base + "/_next/");
    html = html.split("href='/_next/").join("href='" + base + "/_next/");

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("<p>로드 실패</p>", {
      status: 502,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
