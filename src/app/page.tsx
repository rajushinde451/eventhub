import Link from "next/link";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TEMPLATE_CONFIG } from "@/types";

const features = [
  { emoji: "🎨", title: "Beautiful Templates", desc: "7 premium templates for every occasion — weddings, birthdays, housewarmings & more." },
  { emoji: "📋", title: "Smart RSVP System", desc: "Collect RSVPs with guest counts, dietary notes. Auto-prevent duplicate responses." },
  { emoji: "🎫", title: "QR Passes", desc: "Auto-generate unique QR passes for each guest. Scan at entry for seamless check-in." },
  { emoji: "💌", title: "Wishes Wall", desc: "Let guests post heartfelt messages. Moderate and display them beautifully." },
  { emoji: "📍", title: "Google Maps Embed", desc: "Embed your venue location. Guests get directions with one tap." },
  { emoji: "📅", title: "Add to Calendar", desc: "One-click Google Calendar & ICS download. Works on all platforms." },
  { emoji: "📊", title: "Guest Dashboard", desc: "View all RSVPs, filter by status, export CSV. Full guest management." },
  { emoji: "🔗", title: "WhatsApp Sharing", desc: "Share your event link with a beautiful preview optimized for WhatsApp." },
];

const testimonials = [
  { name: "Ananya Sharma", role: "Bride", quote: "EventHub made our wedding invitation so easy! All our guests loved the beautiful page.", avatar: "🌸" },
  { name: "Vikram Nair", role: "Corporate Host", quote: "Managed 300+ RSVPs with zero hassle. The QR check-in was a game changer.", avatar: "👔" },
  { name: "Priya Patel", role: "Birthday Host", quote: "Created a stunning birthday page in 10 minutes. My guests were impressed!", avatar: "🎂" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">EventHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-in">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Free to start · No credit card required</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            Create beautiful{" "}
            <span className="text-gradient">event invitations</span>{" "}
            in minutes
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stunning event pages for weddings, birthdays, housewarmings & more.
            Collect RSVPs, manage guests, generate QR passes — all from one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="xl" variant="gradient" className="gap-2 shadow-lg shadow-violet-500/25">
                Create Your Event <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/event/demo-wedding-celebration">
              <Button size="xl" variant="outline">See Live Demo</Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            {["No credit card", "Free forever plan", "Setup in 5 minutes"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Perfect for every occasion</h2>
          <p className="text-center text-muted-foreground mb-12">Choose from 7 beautifully crafted templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(TEMPLATE_CONFIG).map(([key, config]) => (
              <div
                key={key}
                className={`card-hover rounded-2xl p-6 bg-gradient-to-br ${config.gradient} text-white flex flex-col items-center gap-3 cursor-pointer`}
              >
                <span className="text-4xl">{config.emoji}</span>
                <span className="font-semibold text-center">{config.label}</span>
                <span className="text-xs text-white/80 text-center">{config.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-center text-muted-foreground mb-12">Powerful features to make your event unforgettable</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card-hover rounded-2xl border bg-card p-6 space-y-3">
                <div className="text-3xl">{feature.emoji}</div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground mb-12">Create and share in 4 simple steps</p>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Choose Template", desc: "Pick from 7 premium event templates" },
              { step: "2", title: "Add Details", desc: "Fill in event info, venue & gallery" },
              { step: "3", title: "Publish & Share", desc: "Get your unique event link" },
              { step: "4", title: "Manage RSVPs", desc: "Track guests & check-in with QR" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Loved by hosts</h2>
          <div className="flex items-center justify-center gap-1 mb-12">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            <span className="ml-2 text-muted-foreground text-sm">4.9/5 from 500+ events</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border bg-card p-6 space-y-4">
                <p className="text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-pink-600 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to create your event?</h2>
          <p className="text-white/80 text-lg">Join thousands of hosts who use EventHub for their special occasions.</p>
          <Link href="/signup">
            <Button size="xl" className="bg-white text-violet-600 hover:bg-white/90 shadow-xl gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">EventHub</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 EventHub. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
