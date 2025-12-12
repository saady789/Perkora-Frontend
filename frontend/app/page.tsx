"use client";

import { useState } from "react";
import { Sparkles, Cloud, Code, Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const { isSignedIn, isLoaded } = useUser();

  const handleScanClick = () => {
    if (!isSignedIn) {
      toast("Sign in required", {
        description: "Please sign up or sign in to scan your perks.",
      });
      return;
    }

    console.log("User is signed in, proceed with agent");
  };

  if (!isLoaded) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-sm text-gray-300">
            AI-Powered Perk Discovery
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Startups Leave{" "}
          <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
            Value Behind
          </span>
          <br />
          Discover the Perks You Never Claimed.
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mt-4 mb-10">
          Our AI agent scans over 100 verified startup perks, cloud credits, and
          partner benefits to match you with the ones you qualify for.
        </p>

        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-xl max-w-2xl mx-auto shadow-xl">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="We use AWS, early stage, raised under 100K, need cloud credits..."
            className="h-14 bg-white/10 border-white/20 placeholder-gray-400 text-white"
          />

          {/* <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Tag label="Cloud credits" Icon={Cloud} />
            <Tag label="Dev tools" Icon={Code} />
            <Tag label="Marketing tools" Icon={Megaphone} />
          </div> */}
        </div>

        {!isSignedIn ? (
          <SignInButton mode="modal">
            <Button className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition rounded-full cursor-pointer">
              Scan My Perks
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </SignInButton>
        ) : (
          <Button
            onClick={handleScanClick}
            className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition rounded-full cursor-pointer"
          >
            Scan My Perks
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}

        <p className="text-gray-400 text-sm mt-6">
          Trusted by many startups worldwide
        </p>
      </div>
    </div>
  );
}

function Tag({ label, Icon }: any) {
  return (
    <button className="px-4 py-2 text-sm flex items-center gap-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
