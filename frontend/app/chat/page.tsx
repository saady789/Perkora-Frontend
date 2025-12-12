// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useUser } from "@clerk/nextjs";

// type Role = "user" | "assistant";

// type Message = {
//   id: string;
//   role: Role;
//   content: string;
// };

// type PerkCard = {
//   name: string;
//   company: string;
//   benefit: string;
//   estimated_value_usd: number | null;
//   why_it_matters: string;
//   link: string;
// };

// type Analysis = {
//   summary: {
//     total_estimated_savings_usd: number | null;
//     estimated_runway_extension_months: number | null;
//     notes: string;
//   };
//   perks: PerkCard[];
// };

// type AgentAsk = {
//   success: true;
//   action: "ask_question";
//   reply: string;
// };

// type AgentReady = {
//   success: true;
//   action: "ready";
//   reply: string;
//   analysis: Analysis | null;
// };

// type AgentFail = {
//   success: false;
//   error: string;
// };

// type AgentResponse = AgentAsk | AgentReady | AgentFail;

// const AGENT_URL =
//   "https://hello-service.01kbv3enc6x7tft8pah318ab1g.lmapp.run/api/agent";

// function uid() {
//   if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
//     return crypto.randomUUID();
//   }
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// function formatMoney(n: number | null) {
//   if (n === null || Number.isNaN(n)) return "Depends on usage";
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 0,
//   }).format(n);
// }

// function clampHistory(messages: Message[], max = 10) {
//   const trimmed = messages.slice(-max);
//   return trimmed.map((m) => ({ role: m.role, content: m.content }));
// }

// export default function ScanPage() {
//   const searchParams = useSearchParams();
//   const initialMessage = searchParams.get("q");
//   const router = useRouter();

//   const { user, isLoaded } = useUser();

//   const startedRef = useRef(false);
//   const messagesRef = useRef<Message[]>([]);
//   const bottomRef = useRef<HTMLDivElement | null>(null);
//   const typingIntervalRef = useRef<number | null>(null);

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [mode, setMode] = useState<"qualifying" | "ready">("qualifying");
//   const [analysis, setAnalysis] = useState<Analysis | null>(null);
//   const [resultsTitle, setResultsTitle] = useState<string>("");

//   const chatLocked = mode === "ready";

//   useEffect(() => {
//     messagesRef.current = messages;
//   }, [messages]);

//   const perksCount = useMemo(() => analysis?.perks?.length ?? 0, [analysis]);

//   const stopTyping = () => {
//     if (typingIntervalRef.current) {
//       window.clearInterval(typingIntervalRef.current);
//       typingIntervalRef.current = null;
//     }
//   };

//   const scrollToBottom = (smooth = true) => {
//     bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
//   };

//   useEffect(() => {
//     scrollToBottom(true);
//   }, [messages, loading, mode, analysis]);

//   const addMessage = (role: Role, content: string) => {
//     const m: Message = { id: uid(), role, content };
//     setMessages((prev) => [...prev, m]);
//     return m;
//   };

//   const typewriterAssistant = (text: string) => {
//     stopTyping();

//     const id = uid();
//     setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);

//     let i = 0;
//     const step = 2;
//     const speedMs = 10;

//     typingIntervalRef.current = window.setInterval(() => {
//       i += step;

//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === id
//             ? { ...m, content: text.slice(0, Math.min(i, text.length)) }
//             : m
//         )
//       );

//       if (i >= text.length) stopTyping();
//     }, speedMs);
//   };

//   const callAgent = async (fullHistory: Message[]) => {
//     const payload = { messages: clampHistory(fullHistory, 10) };

//     const res = await fetch(AGENT_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = (await res.json()) as AgentResponse;

//     if (!res.ok) {
//       const msg = (data as any)?.error || `Request failed (${res.status})`;
//       throw new Error(msg);
//     }

//     if (!data || (data as any).success !== true) {
//       throw new Error((data as any)?.error || "Unknown error");
//     }

//     return data as AgentAsk | AgentReady;
//   };

//   const handleAgentResponse = (data: AgentAsk | AgentReady) => {
//     if (data.action === "ask_question") {
//       typewriterAssistant(data.reply || "I need one more detail.");
//       return;
//     }

//     setMode("ready");
//     setResultsTitle(
//       data.reply || "Here is a breakdown of perks for your startup."
//     );
//     setAnalysis(data.analysis ?? null);
//     stopTyping();
//   };

//   const bootstrap = async (q: string) => {
//     const firstUser = { id: uid(), role: "user" as const, content: q };
//     setMessages([firstUser]);
//     setLoading(true);

//     try {
//       const data = await callAgent([firstUser]);
//       handleAgentResponse(data);
//     } catch {
//       typewriterAssistant("Something went wrong talking to the agent.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!initialMessage) return;

//     if (!user?.id) {
//       router.push("/");
//       return;
//     }

//     if (startedRef.current) return;
//     startedRef.current = true;

//     bootstrap(initialMessage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isLoaded, initialMessage, user?.id, router]);

//   const sendMessage = async () => {
//     if (loading) return;
//     if (chatLocked) return;

//     const userText = input.trim();
//     if (!userText) return;

//     setInput("");

//     const nextHistory: Message[] = [
//       ...messagesRef.current,
//       { id: uid(), role: "user", content: userText },
//     ];

//     setMessages(nextHistory);
//     setLoading(true);

//     try {
//       const data = await callAgent(nextHistory);
//       handleAgentResponse(data);
//     } catch {
//       typewriterAssistant("Something went wrong talking to the agent.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const newScan = () => {
//     stopTyping();
//     startedRef.current = false;
//     setMessages([]);
//     setInput("");
//     setLoading(false);
//     setMode("qualifying");
//     setAnalysis(null);
//     setResultsTitle("");
//     router.push("/");
//   };

//   return (
//     <div className="min-h-screen bg-[#050816] text-white">
//       {/* Header */}
//       <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 backdrop-blur">
//         <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
//           <div>
//             <h1 className="text-lg font-semibold">Perk Scanner</h1>
//             <p className="text-xs text-white/60">
//               Qualify in chat, then get a perk breakdown.
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/10">
//               {mode === "ready" ? "Results ready" : "Qualifying"}
//             </div>

//             <button
//               onClick={newScan}
//               className="text-xs px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10"
//             >
//               New scan
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main */}
//       <div className="mx-auto max-w-6xl px-6 pt-8 pb-10">
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//           {/* Chat */}
//           <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
//             <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
//               <div>
//                 <div className="text-sm font-semibold">Chat</div>
//                 <div className="text-xs text-white/60">
//                   One question at a time, then we lock and show results.
//                 </div>
//               </div>

//               {chatLocked && (
//                 <div className="text-xs text-white/70">Locked</div>
//               )}
//             </div>

//             <div className="h-[520px] overflow-y-auto px-4 py-4 space-y-3">
//               {messages.map((m) => (
//                 <div
//                   key={m.id}
//                   className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
//                     m.role === "user"
//                       ? "ml-auto bg-blue-500/15 border-blue-400/20"
//                       : "mr-auto bg-white/5 border-white/10"
//                   }`}
//                 >
//                   <div className="whitespace-pre-wrap">{m.content}</div>
//                 </div>
//               ))}

//               {loading && (
//                 <div className="mr-auto max-w-[92%] rounded-2xl px-4 py-3 text-sm border border-white/10 bg-white/5">
//                   <div className="flex items-center gap-2 text-white/70">
//                     <span className="inline-flex gap-1">
//                       <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.2s]" />
//                       <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.1s]" />
//                       <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
//                     </span>
//                     <span>Thinking…</span>
//                   </div>
//                 </div>
//               )}

//               <div ref={bottomRef} />
//             </div>

//             <div className="px-4 py-4 border-t border-white/10 bg-[#050816]/40">
//               {chatLocked ? (
//                 <div className="text-sm text-white/70">
//                   Results are ready. Start a new scan to run again.
//                 </div>
//               ) : (
//                 <div className="flex gap-3">
//                   <Input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Answer the agent or add more details…"
//                     className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") sendMessage();
//                     }}
//                     disabled={loading}
//                   />
//                   <Button
//                     onClick={sendMessage}
//                     disabled={loading}
//                     className="bg-gradient-to-r from-blue-500 to-purple-500 disabled:opacity-60"
//                   >
//                     Send
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Results */}
//           <div className="lg:col-span-3">
//             {mode !== "ready" ? (
//               <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
//                 <div className="text-sm text-white/70">
//                   Results will appear here when the backend returns action
//                   "ready".
//                 </div>
//                 <div className="mt-6 space-y-3">
//                   <div className="h-3 w-3/5 bg-white/10 rounded animate-pulse" />
//                   <div className="h-3 w-4/5 bg-white/10 rounded animate-pulse" />
//                   <div className="h-3 w-2/5 bg-white/10 rounded animate-pulse" />
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-5">
//                 <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <h2 className="text-lg font-semibold">
//                         {resultsTitle || "Perk breakdown"}
//                       </h2>
//                       <p className="text-sm text-white/60 mt-1">
//                         Cards come from your DB rows plus your analysis AI call.
//                       </p>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-xs text-white/60">
//                         Estimated savings
//                       </div>
//                       <div className="text-base font-semibold">
//                         {formatMoney(
//                           analysis?.summary?.total_estimated_savings_usd ?? null
//                         )}
//                       </div>

//                       <div className="text-xs text-white/60 mt-2">
//                         Runway extension
//                       </div>
//                       <div className="text-base font-semibold">
//                         {analysis?.summary?.estimated_runway_extension_months !=
//                         null
//                           ? `${analysis.summary.estimated_runway_extension_months} mo`
//                           : "Depends on usage"}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4 text-sm text-white/70 whitespace-pre-wrap">
//                     {analysis?.summary?.notes || "No notes returned."}
//                   </div>
//                 </div>

//                 {/* Cards */}
//                 {!analysis || !Array.isArray(analysis.perks) ? (
//                   <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
//                     No analysis payload returned. Check your analyzePerksWithAI
//                     JSON output.
//                   </div>
//                 ) : analysis.perks.length === 0 ? (
//                   <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
//                     No perks returned. That means your SmartSQL query returned
//                     an empty list.
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {analysis.perks.map((perk, idx) => (
//                       <div
//                         key={`${perk.company}-${perk.name}-${idx}`}
//                         className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/7 transition"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <div className="text-sm font-semibold">
//                               {perk.name}
//                             </div>
//                             <div className="text-xs text-white/60 mt-1">
//                               {perk.company}
//                             </div>
//                           </div>

//                           <div className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/10">
//                             {perk.estimated_value_usd != null
//                               ? formatMoney(perk.estimated_value_usd)
//                               : "Value unknown"}
//                           </div>
//                         </div>

//                         <div className="mt-3 text-sm text-white/80 whitespace-pre-wrap">
//                           {perk.benefit}
//                         </div>

//                         <div className="mt-3 text-xs text-white/60 whitespace-pre-wrap">
//                           {perk.why_it_matters}
//                         </div>

//                         <div className="mt-4 flex items-center justify-between gap-3">
//                           {perk.link ? (
//                             <a
//                               href={perk.link}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-sm text-blue-300 hover:text-blue-200 underline underline-offset-4"
//                             >
//                               View perk
//                             </a>
//                           ) : (
//                             <span className="text-xs text-white/50">
//                               Link missing
//                             </span>
//                           )}

//                           <button
//                             onClick={() => {
//                               if (perk.link)
//                                 navigator.clipboard.writeText(perk.link);
//                             }}
//                             className="text-xs px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
//                             disabled={!perk.link}
//                           >
//                             Copy link
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="text-xs text-white/50">
//                   Chat is locked after results. Click New scan to try again.
//                 </div>

//                 <div className="text-xs text-white/50">
//                   Found: {perksCount} perk{perksCount === 1 ? "" : "s"}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

type PerkCard = {
  name: string;
  company: string;
  benefit: string;
  estimated_value_usd: number | null;
  why_it_matters: string;
  link: string;
};

type Analysis = {
  summary: {
    total_estimated_savings_usd: number | null;
    estimated_runway_extension_months: number | null;
    notes: string;
  };
  perks: PerkCard[];
};

type AgentAsk = {
  success: true;
  action: "ask_question";
  reply: string;
};

type AgentReady = {
  success: true;
  action: "ready";
  reply: string;
  analysis: Analysis | null;
};

type AgentFail = {
  success: false;
  error: string;
};

type AgentResponse = AgentAsk | AgentReady | AgentFail;

const AGENT_URL =
  "https://hello-service.01kbv3enc6x7tft8pah318ab1g.lmapp.run/api/agent";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(n: number | null) {
  if (n === null || Number.isNaN(n)) return "Depends on usage";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function clampHistory(messages: Message[], max = 10) {
  const trimmed = messages.slice(-max);
  return trimmed.map((m) => ({ role: m.role, content: m.content }));
}

export default function ScanPage() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("q");
  const router = useRouter();

  const { user, isLoaded } = useUser();

  const startedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"qualifying" | "ready">("qualifying");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resultsTitle, setResultsTitle] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const perksCount = useMemo(() => analysis?.perks?.length ?? 0, [analysis]);

  const stopTyping = () => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading]);

  const typewriterAssistant = (text: string) => {
    stopTyping();

    const id = uid();
    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);

    let i = 0;
    const step = 2;
    const speedMs = 10;

    typingIntervalRef.current = window.setInterval(() => {
      i += step;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: text.slice(0, Math.min(i, text.length)) }
            : m
        )
      );

      if (i >= text.length) stopTyping();
    }, speedMs);
  };

  const callAgent = async (fullHistory: Message[]) => {
    const payload = { messages: clampHistory(fullHistory, 10) };

    const res = await fetch(AGENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as AgentResponse;

    if (!res.ok) {
      const msg = (data as any)?.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }

    if (!data || (data as any).success !== true) {
      throw new Error((data as any)?.error || "Unknown error");
    }

    return data as AgentAsk | AgentReady;
  };

  const handleAgentResponse = (data: AgentAsk | AgentReady) => {
    if (data.action === "ask_question") {
      typewriterAssistant(data.reply || "I need one more detail.");
      return;
    }

    stopTyping();
    setMode("ready");
    setResultsTitle(data.reply || "Here are perks you may qualify for.");
    setAnalysis(data.analysis ?? null);
  };

  const bootstrap = async (q: string) => {
    const firstUser: Message = { id: uid(), role: "user", content: q };
    setMessages([firstUser]);
    setLoading(true);
    setErrorText("");

    try {
      const data = await callAgent([firstUser]);
      handleAgentResponse(data);
    } catch (e: any) {
      setErrorText(e?.message || "Something went wrong.");
      typewriterAssistant("Sorry, something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!initialMessage) return;

    if (!user?.id) {
      router.push("/");
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    bootstrap(initialMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, initialMessage, user?.id, router]);

  const sendMessage = async () => {
    if (loading) return;
    if (mode === "ready") return;

    const userText = input.trim();
    if (!userText) return;

    setInput("");
    setErrorText("");

    const nextHistory: Message[] = [
      ...messagesRef.current,
      { id: uid(), role: "user", content: userText },
    ];

    setMessages(nextHistory);
    setLoading(true);

    try {
      const data = await callAgent(nextHistory);
      handleAgentResponse(data);
    } catch (e: any) {
      setErrorText(e?.message || "Something went wrong.");
      typewriterAssistant("Sorry, something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const newScan = () => {
    stopTyping();
    startedRef.current = false;

    setMessages([]);
    setInput("");
    setLoading(false);
    setMode("qualifying");
    setAnalysis(null);
    setResultsTitle("");
    setErrorText("");

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Perk Scanner</h1>
            <p className="text-xs text-white/60">
              Answer a few questions, then get a perk breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={newScan}
              className="text-xs px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10"
            >
              Start over
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-12">
        {mode === "qualifying" ? (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <div className="text-sm font-semibold">Chat</div>
                <div className="text-xs text-white/60 mt-1">
                  Reply normally. I will ask one question at a time.
                </div>
              </div>

              <div className="h-[560px] overflow-y-auto px-5 py-5 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                      m.role === "user"
                        ? "ml-auto bg-blue-500/15 border-blue-400/20"
                        : "mr-auto bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}

                {loading && (
                  <div className="mr-auto max-w-[92%] rounded-2xl px-4 py-3 text-sm border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.1s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                      </span>
                      <span>Thinking…</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="px-5 py-4 border-t border-white/10 bg-[#050816]/40">
                {errorText ? (
                  <div className="text-xs text-red-200 mb-2">{errorText}</div>
                ) : null}

                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer…"
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 disabled:opacity-60"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-5">
            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <h2 className="text-xl font-semibold">
                    {resultsTitle || "Your perk breakdown"}
                  </h2>
                  <p className="text-sm text-white/60 mt-2">
                    {perksCount > 0
                      ? `${perksCount} perk${
                          perksCount === 1 ? "" : "s"
                        } matched your startup`
                      : "No matching perks found from your current database."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xs text-white/60">
                      Estimated savings
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {formatMoney(
                        analysis?.summary?.total_estimated_savings_usd ?? null
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xs text-white/60">
                      Runway extension
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {analysis?.summary?.estimated_runway_extension_months !=
                      null
                        ? `${analysis.summary.estimated_runway_extension_months} mo`
                        : "Depends on usage"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-sm text-white/75 whitespace-pre-wrap">
                {analysis?.summary?.notes
                  ? analysis.summary.notes
                  : "To improve estimates, include your monthly spend for cloud and tools in the chat next time."}
              </div>
            </div>

            {/* Cards */}
            {!analysis || !Array.isArray(analysis.perks) ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                We could not generate a detailed breakdown this time. Try again
                with a bit more detail about your stack and expected monthly
                spend.
              </div>
            ) : analysis.perks.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                No perks matched. Add more perks to your database or try a
                broader stack like aws, gcp, azure, github, stripe, vercel.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.perks.map((perk, idx) => (
                  <div
                    key={`${perk.company}-${perk.name}-${idx}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/7 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{perk.name}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {perk.company}
                        </div>
                      </div>

                      <div className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/10">
                        {perk.estimated_value_usd != null
                          ? formatMoney(perk.estimated_value_usd)
                          : "Value varies"}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-white/85 whitespace-pre-wrap">
                      {perk.benefit}
                    </div>

                    <div className="mt-3 text-xs text-white/60 whitespace-pre-wrap">
                      {perk.why_it_matters}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {perk.link ? (
                        <a
                          href={perk.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-300 hover:text-blue-200 underline underline-offset-4"
                        >
                          View perk
                        </a>
                      ) : (
                        <span className="text-xs text-white/50">
                          Link missing
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (perk.link)
                            navigator.clipboard.writeText(perk.link);
                        }}
                        className="text-xs px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
                        disabled={!perk.link}
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-start">
              <Button
                onClick={newScan}
                className="bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer"
              >
                Run another scan
              </Button>

              <button
                onClick={() => router.push("/")}
                className="text-xs px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10"
              >
                Back to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
