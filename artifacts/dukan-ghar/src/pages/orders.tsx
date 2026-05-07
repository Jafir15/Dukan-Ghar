import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Package, Clock, ChevronRight, Truck, CheckCircle, Box } from "lucide-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrders } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "زیرِ التواء", icon: <Clock className="w-3.5 h-3.5" />, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  packed: { label: "پیک ہوگیا", icon: <Box className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  on_the_way: { label: "راستے میں", icon: <Truck className="w-3.5 h-3.5" />, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  delivered: { label: "پہنچ گیا", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

export default function Orders() {
  const [, setLocation] = useLocation();
  const [trackingInput, setTrackingInput] = useState("");
  const { data: orders, isLoading } = useListOrders({ sessionId: getSessionId() });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setLocation(`/track/${encodeURIComponent(trackingInput.trim())}`);
    }
  };

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-5">
        <h1 className="urdu-text text-2xl font-bold text-right">میرے آرڈر</h1>

        {/* Tracking Search */}
        <form onSubmit={handleTrack} className="flex gap-2">
          <Input
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Tracking Number (e.g. DG123456)"
            data-testid="input-tracking"
          />
          <Button type="submit" className="shrink-0 rounded-xl px-4" data-testid="button-track">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Orders List */}
        <div className="flex flex-col gap-3">
          <h2 className="urdu-text text-lg font-semibold text-right text-muted-foreground">تمام آرڈر</h2>
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-24 rounded-xl" />)
          ) : orders?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="urdu-text text-muted-foreground">ابھی تک کوئی آرڈر نہیں</p>
              <p className="text-sm text-muted-foreground mt-1">No orders yet.</p>
            </div>
          ) : (
            orders?.map((order) => {
              const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
              return (
                <button
                  key={order.id}
                  data-testid={`card-order-${order.id}`}
                  onClick={() => setLocation(`/track/${order.trackingNumber}`)}
                  className="bg-card border rounded-xl p-4 flex flex-col gap-2 shadow-sm text-left w-full hover-elevate hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.icon}
                      <span className="urdu-text">{status.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-primary">{order.trackingNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("ur-PK")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-xs">View details</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs. {order.total}</p>
                      <p className="text-xs text-muted-foreground urdu-text">{order.customerName}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
