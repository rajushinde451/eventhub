"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";

interface QRPassCardProps {
  qrCode: string;
  passCode: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  venueName?: string;
}

export function QRPassCard({ qrCode, passCode, guestName, eventTitle, eventDate, venueName }: QRPassCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    async function generateQR() {
      try {
        const QRCode = (await import("qrcode")).default;
        const canvas = canvasRef.current;
        if (!canvas) return;
        await QRCode.toCanvas(canvas, qrCode, {
          width: 160,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        });
        setQrDataUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    }
    generateQR();
  }, [qrCode]);

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${guestName.replace(/\s+/g, "-").toLowerCase()}-qr-pass.png`;
    a.click();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `My QR Pass – ${eventTitle}`,
        text: `My entry pass for ${eventTitle}: ${qrCode}`,
      });
    }
  }

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 p-6 max-w-xs mx-auto">
      <div className="text-center space-y-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Entry Pass</p>
          <h3 className="font-bold text-lg mt-1">{eventTitle}</h3>
          <p className="text-sm text-muted-foreground">{formatEventDate(eventDate)}</p>
          {venueName && <p className="text-xs text-muted-foreground">{venueName}</p>}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 inline-block shadow-sm">
          <canvas ref={canvasRef} className="block" />
        </div>

        <div>
          <p className="font-semibold text-sm">{guestName}</p>
          <p className="font-mono text-xs text-muted-foreground mt-1">{passCode || qrCode}</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 gap-1.5" disabled={!qrDataUrl}>
            <Download className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare} className="flex-1 gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Show this QR code at the venue entrance
        </p>
      </div>
    </div>
  );
}
