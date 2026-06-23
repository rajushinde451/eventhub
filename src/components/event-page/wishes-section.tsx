"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { wishSchema, type WishInput } from "@/lib/validations";
import { submitWish } from "@/app/actions/wishes";
import { formatTimeAgo } from "@/lib/utils";
import type { Wish } from "@/types";

const GRADIENT_BACKGROUNDS = [
  "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
  "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
  "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
  "from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
  "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
];

function WishCard({ wish, index }: { wish: Wish; index: number }) {
  const bg = GRADIENT_BACKGROUNDS[index % GRADIENT_BACKGROUNDS.length];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${bg} p-5 space-y-3`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {wish.name[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{wish.name}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(wish.created_at)}</p>
        </div>
        <Heart className="w-3.5 h-3.5 text-pink-400 ml-auto" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{wish.message}</p>
    </div>
  );
}

export function WishesSection({ eventId, wishes: initialWishes }: { eventId: string; wishes: Wish[] }) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WishInput>({
    resolver: zodResolver(wishSchema),
  });

  async function onSubmit(data: WishInput) {
    setSubmitting(true);
    try {
      const result = await submitWish(eventId, data);
      if (result.error) { toast.error(result.error); return; }
      const newWish: Wish = {
        id: result.data!.id,
        event_id: eventId,
        name: data.name,
        message: data.message,
        approved: true,
        created_at: new Date().toISOString(),
      };
      setWishes((prev) => [newWish, ...prev]);
      reset();
      setShowForm(false);
      toast.success("Your wish was sent! 💌");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5" id="wishes">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wishes Wall</h2>
        <Button
          variant={showForm ? "outline" : "default"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Heart className="w-4 h-4" />
          {showForm ? "Cancel" : "Send Wishes"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-card p-5 space-y-4 animate-in">
          <h3 className="font-semibold">Leave your wishes 💌</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wish-name">Your Name</Label>
              <Input id="wish-name" placeholder="Ananya Kumar" error={errors.name?.message} {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wish-message">Your Message</Label>
              <Textarea
                id="wish-message"
                placeholder="Wishing you a lifetime of happiness..."
                rows={3}
                error={errors.message?.message}
                {...register("message")}
              />
            </div>
            <Button type="submit" loading={submitting} className="gap-2 w-full">
              <Send className="w-4 h-4" />
              Send Wishes
            </Button>
          </form>
        </div>
      )}

      {wishes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Be the first to send wishes!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {wishes.map((wish, i) => (
            <WishCard key={wish.id} wish={wish} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
