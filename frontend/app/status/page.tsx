"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type StatusState = "idle" | "loading" | "ok" | "error";

export default function Status() {
  const [status, setStatus] = useState<StatusState>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      setStatus("loading");

      try {
        const res = await axios.get(
          "https://hello-service.01kbv3enc6x7tft8pah318ab1g.lmapp.run/status",
          { timeout: 5000 }
        );

        setStatus("ok");
        setMessage(
          typeof res.data === "string" ? res.data : JSON.stringify(res.data)
        );
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "API unreachable");
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-sm text-left">
      <div className="flex items-center gap-2">
        <span className="font-medium">API Status:</span>

        {status === "loading" && (
          <span className="text-yellow-400">Checking...</span>
        )}

        {status === "ok" && <span className="text-green-400">Connected</span>}

        {status === "error" && <span className="text-red-400">Offline</span>}
      </div>

      {message && (
        <div className="mt-2 text-xs text-gray-400 break-all">{message}</div>
      )}
    </div>
  );
}
