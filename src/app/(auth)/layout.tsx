import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left branding panel */}
      <div className="hidden md:flex flex-col bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">EventHub</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Create beautiful event invitations in minutes
            </h1>
            <p className="text-white/80 text-lg">
              Collect RSVPs, manage guests, generate QR passes, and share your events via WhatsApp.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { emoji: "💍", label: "Wedding" },
                { emoji: "🏡", label: "Housewarming" },
                { emoji: "🎂", label: "Birthday" },
                { emoji: "👶", label: "Naming Ceremony" },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/60 text-sm">
            Trusted by thousands of hosts across India
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6">
          <Link href="/" className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">EventHub</span>
          </Link>
          <div className="md:ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
