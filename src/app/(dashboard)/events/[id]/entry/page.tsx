"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { QrCode, CheckCircle, XCircle, Users, Scan, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { checkInGuest, getEventRSVPs } from "@/app/actions/rsvp";

interface CheckInResult {
  success: boolean;
  guestName?: string;
  eventTitle?: string;
  guestCount?: number;
  error?: string;
}

export default function EntryManagementPage() {
  const params = useParams<{ id: string }>();
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [rsvps, setRsvps] = useState<{ checkedIn: number; total: number; attending: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadStats = useCallback(async () => {
    const data = await getEventRSVPs(params.id);
    setRsvps({
      total: data.length,
      attending: data.filter((r) => r.status === "attending").length,
      checkedIn: data.filter((r) => r.checked_in).length,
    });
  }, [params.id]);

  useEffect(() => {
    loadStats();
    inputRef.current?.focus();
  }, [loadStats]);

  async function handleCheckIn(code?: string) {
    const qrCode = code || qrInput.trim();
    if (!qrCode) return;

    setLoading(true);
    try {
      const result = await checkInGuest(qrCode);
      if (result.error) {
        setLastResult({ success: false, error: result.error });
        toast.error(result.error);
      } else if (result.data) {
        setLastResult({
          success: true,
          guestName: result.data.guestName,
          guestCount: result.data.guestCount,
        });
        toast.success(`Welcome, ${result.data.guestName}!`);
        loadStats();
      }
    } finally {
      setLoading(false);
      setQrInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleCheckIn();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold">Entry Management</h1>
        <p className="text-muted-foreground">Scan QR codes to check in guests</p>
      </div>

      {/* Stats */}
      {rsvps && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Expected", value: rsvps.attending, color: "text-blue-500" },
            { label: "Checked In", value: rsvps.checkedIn, color: "text-green-500" },
            { label: "Remaining", value: rsvps.attending - rsvps.checkedIn, color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* QR Scanner area */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
              <Scan className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold">QR Code Scanner</p>
              <p className="text-xs text-muted-foreground">Connect a QR scanner or type the code manually</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Scan or type QR code..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono text-sm"
              autoComplete="off"
            />
            <Button
              onClick={() => handleCheckIn()}
              loading={loading}
              disabled={!qrInput.trim()}
            >
              Check In
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Press Enter after scanning. The input field auto-focuses after each check-in.
          </p>
        </CardContent>
      </Card>

      {/* Last result */}
      {lastResult && (
        <div className={`rounded-xl border-2 p-5 flex items-center gap-4 ${
          lastResult.success
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
        }`}>
          {lastResult.success ? (
            <CheckCircle className="w-10 h-10 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 text-red-500 shrink-0" />
          )}
          <div>
            {lastResult.success ? (
              <>
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                  ✅ Welcome, {lastResult.guestName}!
                </p>
                {lastResult.guestCount && lastResult.guestCount > 1 && (
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    +{lastResult.guestCount - 1} additional {lastResult.guestCount > 2 ? "guests" : "guest"}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-bold text-red-700 dark:text-red-400">
                  ❌ {lastResult.error}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <Button variant="ghost" size="sm" onClick={loadStats} className="gap-2 w-full">
        <RefreshCw className="w-4 h-4" />
        Refresh Stats
      </Button>
    </div>
  );
}
