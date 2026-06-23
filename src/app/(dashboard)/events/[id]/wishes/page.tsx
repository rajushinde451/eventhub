"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventWishes, moderateWish, deleteWish } from "@/app/actions/wishes";
import { formatTimeAgo } from "@/lib/utils";
import type { Wish } from "@/types";

function WishCard({ wish, onApprove, onReject, onDelete }: {
  wish: Wish;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`rounded-xl border p-5 space-y-3 transition-opacity ${!wish.approved ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{wish.name}</p>
            <Badge variant={wish.approved ? "success" : "secondary"}>
              {wish.approved ? "Approved" : "Hidden"}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(wish.created_at)}</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">{wish.message}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {wish.approved ? (
            <Button size="icon" variant="ghost" onClick={onReject} title="Hide wish">
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" onClick={onApprove} title="Approve wish">
              <Eye className="w-4 h-4 text-green-500" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onDelete} title="Delete wish">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WishesPage() {
  const params = useParams<{ id: string }>();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getEventWishes(params.id, true);
    setWishes(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    const result = await moderateWish(id, true);
    if (result.error) { toast.error(result.error); return; }
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, approved: true } : w));
  }

  async function handleReject(id: string) {
    const result = await moderateWish(id, false);
    if (result.error) { toast.error(result.error); return; }
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, approved: false } : w));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this wish?")) return;
    const result = await deleteWish(id);
    if (result.error) { toast.error(result.error); return; }
    setWishes((prev) => prev.filter((w) => w.id !== id));
    toast.success("Wish deleted");
  }

  const approved = wishes.filter((w) => w.approved);
  const hidden = wishes.filter((w) => !w.approved);
  const filtered = tab === "approved" ? approved : tab === "hidden" ? hidden : wishes;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold">Wishes Wall</h1>
        <p className="text-muted-foreground">{wishes.length} total wishes · {approved.length} visible</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({wishes.length})</TabsTrigger>
          <TabsTrigger value="approved">Visible ({approved.length})</TabsTrigger>
          <TabsTrigger value="hidden">Hidden ({hidden.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No wishes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  onApprove={() => handleApprove(wish.id)}
                  onReject={() => handleReject(wish.id)}
                  onDelete={() => handleDelete(wish.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
