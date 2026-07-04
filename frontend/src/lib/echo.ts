import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  if (!echoInstance) {
    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      forceTLS: false,
      enabledTransports: ["ws"],
    });
  }

  return echoInstance;
}
