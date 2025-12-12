"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export function Appbar() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#050816]/95 border-b border-white/10 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 sm:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Perkora"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="text-sm font-semibold text-white tracking-tight">
            Perkora
          </span>
        </Link>

        {/* Auth */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-white/70 hover:text-white transition">
                Sign in
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
