"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Download, Users, Search, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventRSVPs, exportGuestListCSV } from "@/app/actions/rsvp";
import { formatTimeAgo, getStatusColor } from "@/lib/utils";
import type { RSVP } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  attending: "Attending",
  not_attending: "Not Attending",
  maybe: "Maybe",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  attending: <CheckCircle className="w-3.5 h-3.5" />,
  not_attending: <XCircle className="w-3.5 h-3.5" />,
  maybe: <HelpCircle className="w-3.5 h-3.5" />,
};

export default function GuestsPage() {
  const params = useParams<{ id: string }>();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getEventRSVPs(params.id);
    setRsvps(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = rsvps.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.phone || "").includes(search);
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: rsvps.length,
    attending: rsvps.filter((r) => r.status === "attending").length,
    maybe: rsvps.filter((r) => r.status === "maybe").length,
    not_attending: rsvps.filter((r) => r.status === "not_attending").length,
  };

  const totalGuests = rsvps
    .filter((r) => r.status === "attending")
    .reduce((s, r) => s + (r.guest_count || 1), 0);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportGuestListCSV(params.id);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guests-${params.id}.csv`;
      a.click();
      toast.success("Guest list exported");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Guest List</h1>
          <p className="text-muted-foreground">{rsvps.length} RSVPs · {totalGuests} total guests expected</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          loading={exporting}
          className="gap-2"
          disabled={rsvps.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total RSVPs", value: counts.all, color: "text-violet-500" },
          { label: "Attending", value: counts.attending, color: "text-green-500" },
          { label: "Maybe", value: counts.maybe, color: "text-amber-500" },
          { label: "Not Attending", value: counts.not_attending, color: "text-red-500" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="attending">Attending ({counts.attending})</TabsTrigger>
          <TabsTrigger value="maybe">Maybe ({counts.maybe})</TabsTrigger>
          <TabsTrigger value="not_attending">Declined ({counts.not_attending})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No RSVPs found</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Guests</TableHead>
                    <TableHead className="hidden lg:table-cell">Entry</TableHead>
                    <TableHead className="hidden md:table-cell">RSVP Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rsvp.name}</p>
                          {rsvp.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
                              {rsvp.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {rsvp.phone && <p>{rsvp.phone}</p>}
                          {rsvp.email && <p className="text-muted-foreground text-xs">{rsvp.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(rsvp.status)}`}>
                          {STATUS_ICONS[rsvp.status]}
                          {STATUS_LABELS[rsvp.status]}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{rsvp.guest_count || 1}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {rsvp.checked_in ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="w-3 h-3" /> Entered
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatTimeAgo(rsvp.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
