"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import { Loader2, Send, Sparkles, UserRound, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { AdvisoryMessage, AdvisorySession, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const ROLE_META = {
  farmer: { label: "You", icon: UserRound },
  expert: { label: "Expert", icon: Stethoscope },
  ai: { label: "Advisor", icon: Sparkles },
} as const;

/** Bangla needs its own face; detect it per message rather than per session. */
const hasBengali = (text: string) => /[ঀ-৿]/.test(text);

function Bubble({ message, isMine }: { message: AdvisoryMessage; isMine: boolean }) {
  const meta = ROLE_META[message.senderRole];
  const Icon = meta.icon;

  if (message.messageType === "image") {
    return (
      <div className={cn("flex", isMine && "justify-end")}>
        <div className="overflow-hidden rounded-card">
          <Image src={message.messageContent} alt="" width={280} height={200} className="object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", isMine && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          message.senderRole === "ai"
            ? "bg-canopy-tint text-canopy"
            : message.senderRole === "expert"
            ? "bg-shoot text-ink"
            : "bg-surface-sunk text-ink-soft"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>

      <div className={cn("max-w-[min(42rem,80%)]", isMine && "text-right")}>
        <p className="mb-1 text-[0.6875rem] text-ink-faint">{meta.label}</p>
        <div
          className={cn(
            "inline-block rounded-card px-4 py-3 text-left text-sm leading-relaxed",
            isMine ? "bg-canopy text-ink-invert" : "bg-surface card-shadow",
            hasBengali(message.messageContent) && "bn"
          )}
        >
          <p className="whitespace-pre-line">{message.messageContent}</p>
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({
  session,
  user,
}: {
  session: AdvisorySession;
  user: User;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<AdvisoryMessage[]>(session.chatHistory);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const closed = session.status === "resolved" || session.status === "closed";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, thinking]);

  useEffect(() => {
    let socket: Socket | null = null;
    // The token fetch is async, so an effect torn down before it resolves would
    // otherwise create a socket nothing ever disconnects — which is exactly
    // what React's double-invoked effects do in development.
    let cancelled = false;

    const connect = async () => {
      const res = await fetch("/api/socket-token", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const { token } = (await res.json()) as { token: string | null };
      if (!token || cancelled) return;

      // Polling is left available so a blocked WebSocket upgrade degrades
      // instead of leaving the conversation stuck on "connecting".
      socket = io(`${API_BASE}/advisory`, { auth: { token } });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        setSocketError(null);
        socket?.emit("session:join", { sessionId: session._id });
      });
      socket.on("disconnect", () => setConnected(false));

      // Without this a rejected handshake is indistinguishable from a slow one:
      // the composer stays disabled behind "Reconnecting" forever and says
      // nothing about why. Socket.IO retries on its own, so this reports the
      // reason rather than giving up.
      socket.on("connect_error", (err: Error) => {
        setConnected(false);
        setSocketError(err.message);
      });

      // History is authoritative — a reconnect replaces rather than appends.
      socket.on("session:history", (payload: { messages: AdvisoryMessage[] }) => {
        setMessages(payload.messages);
      });

      socket.on("session:ai-thinking", () => {
        setThinking(true);
        setStreaming("");
      });

      // Tokens arrive as they are generated, so the reply is seen forming
      // rather than appearing after a long silence.
      socket.on("session:message-chunk", (payload: { delta: string }) => {
        setStreaming((prev) => prev + payload.delta);
      });

      socket.on("session:message", (payload: { message: AdvisoryMessage }) => {
        setMessages((prev) => {
          // The same message can arrive twice — a second tab, a reconnect that
          // replays history, or an effect re-running in development. Identity
          // is sender plus content plus timestamp; appending blindly would show
          // the farmer the same answer twice.
          const seen = prev.some(
            (m) =>
              m.sentAt === payload.message.sentAt &&
              m.senderRole === payload.message.senderRole &&
              m.messageContent === payload.message.messageContent
          );
          return seen ? prev : [...prev, payload.message];
        });
        setStreaming("");
      });

      socket.on("session:ai-thinking-done", () => {
        setThinking(false);
        setStreaming("");
      });

      socket.on("session:error", (payload: { message: string }) => {
        setThinking(false);
        setStreaming("");
        toast.error(payload.message);
      });
    };

    void connect();
    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [session._id]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit("session:message", {
      sessionId: session._id,
      messageType: "text",
      messageContent: text,
    });
    setDraft("");
  };

  return (
    // dvh rather than vh so a mobile URL bar collapsing does not clip the
    // composer, and extra bottom room on small screens for the fixed nav bar.
    <div className="flex h-[calc(100dvh-19rem)] flex-col lg:h-[calc(100dvh-13rem)]">
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {session.attachedMediaUrls.length ? (
          <div className="flex flex-wrap gap-2">
            {session.attachedMediaUrls.map((url) => (
              <div key={url} className="h-28 w-28 overflow-hidden rounded-tile">
                <Image src={url} alt="" width={112} height={112} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        {messages.map((m, i) => (
          <Bubble key={`${m.sentAt}-${i}`} message={m} isMine={m.senderId === user.userCode} />
        ))}

        {streaming ? (
          <Bubble
            message={{
              senderRole: "ai",
              messageType: "text",
              messageContent: streaming,
              sentAt: new Date().toISOString(),
            }}
            isMine={false}
          />
        ) : null}

        {thinking && !streaming ? (
          <div className="flex items-center gap-2.5 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" />
            The advisor is reading your field&apos;s numbers…
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {closed ? (
        <p className="mt-4 rounded-tile bg-surface-sunk px-4 py-3 text-center text-sm text-ink-soft">
          This conversation is closed.
        </p>
      ) : (
        <form onSubmit={send} className="mt-4 flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            rows={1}
            placeholder={connected ? "Type your reply…" : "Connecting…"}
            disabled={!connected}
            className="max-h-32 min-h-[3rem] flex-1 resize-none rounded-card border border-line bg-surface px-4 py-3.5 text-sm placeholder:text-ink-faint focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15 disabled:opacity-60"
          />
          <Button type="submit" size="lg" disabled={!connected || !draft.trim()} className="h-12 w-12 !px-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      )}

      {!connected ? (
        <p className="mt-2 text-center text-xs text-ink-faint">
          {socketError
            ? `Can't reach the conversation: ${socketError}`
            : "Reconnecting to the conversation…"}
        </p>
      ) : null}
      <button type="button" onClick={() => router.refresh()} className="sr-only">
        Refresh
      </button>
    </div>
  );
}
