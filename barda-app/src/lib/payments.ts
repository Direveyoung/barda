/**
 * Toss Payments SDK wrapper (script-tag approach).
 *
 * The SDK is loaded lazily the first time `requestPayment` is called.
 * If `NEXT_PUBLIC_TOSS_CLIENT_KEY` is not set the call gracefully
 * alerts the user and returns without throwing.
 */

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

/* ---------- SDK loader ---------- */

interface TossPaymentsInstance {
  requestPayment: (
    method: string,
    params: {
      amount: number;
      orderId: string;
      orderName: string;
      customerEmail?: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
}

type TossPaymentsFactory = (clientKey: string) => TossPaymentsInstance;

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

let sdkPromise: Promise<TossPaymentsFactory> | null = null;

function loadTossPayments(): Promise<TossPaymentsFactory> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<TossPaymentsFactory>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("TossPayments SDK can only be loaded in the browser"));
      return;
    }

    if (window.TossPayments) {
      resolve(window.TossPayments);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;

    script.onload = () => {
      if (window.TossPayments) {
        resolve(window.TossPayments);
      } else {
        reject(new Error("TossPayments SDK loaded but not available on window"));
      }
    };

    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load TossPayments SDK script"));
    };

    document.head.appendChild(script);
  });

  return sdkPromise;
}

/* ---------- Public API ---------- */

export async function requestPayment(
  orderId: string,
  amount: number,
  orderName: string,
  customerEmail?: string,
): Promise<void> {
  if (!CLIENT_KEY) {
    alert("결제 기능이 아직 설정되지 않았습니다. (Toss client key missing)");
    return;
  }

  const TossPayments = await loadTossPayments();
  const toss = TossPayments(CLIENT_KEY);

  const origin = window.location.origin;

  await toss.requestPayment("카드", {
    amount,
    orderId,
    orderName,
    ...(customerEmail ? { customerEmail } : {}),
    successUrl: `${origin}/?payment=success`,
    failUrl: `${origin}/?payment=fail`,
  });
}
