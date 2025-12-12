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
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo area */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center overflow-hidden">
            {/* Replace later with Image */}
            <Image src="/icon.png" alt="" width={32} height={32} />
            <span className="text-sm font-semibold text-white"></span>
          </div>
          <span className="text-sm font-medium text-white/90">Perkora</span>
        </Link>

        {/* Auth */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-white/70 hover:text-white transition cursor-pointer">
                Sign in
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer">
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
