"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ScanPage() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("q");
  const router = useRouter();

  const { user, isSignedIn, isLoaded } = useUser();
  console.log("user is ", user?.id);
  const hasStartedRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // bootstrap the conversation
  useEffect(() => {
    if (!initialMessage) return;
    if (!user?.id) router.push("/");
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

    const firstMessage: Message = {
      role: "user",
      content: initialMessage,
    };

    setMessages([firstMessage]);
    startAgent(firstMessage.content);
  }, [initialMessage]);

  const startAgent = async (message: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://hello-service.01kbv3enc6x7tft8pah318ab1g.lmapp.run/api/agent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Agent did not respond.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong talking to the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    setLoading(true);

    try {
      const res = await fetch(
        "https://hello-service.01kbv3enc6x7tft8pah318ab1g.lmapp.run/api/agent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: userMessage }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Agent did not respond.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong talking to the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 pt-24 flex flex-col">
      <h1 className="text-xl font-semibold mb-6">Perk Scanner</h1>

      {/* messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xl rounded-lg px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-blue-500/20 ml-auto"
                : "bg-white/10 mr-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-white/10 max-w-xl rounded-lg px-4 py-3 text-sm mr-auto text-gray-400">
            Agent is thinking...
          </div>
        )}
      </div>

      {/* input */}
      <div className="flex gap-3 pb-6">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Answer the agent or add more details..."
          className="bg-white/10 border-white/20 text-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <Button
          onClick={sendMessage}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
