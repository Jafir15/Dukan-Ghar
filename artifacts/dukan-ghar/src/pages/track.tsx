import { useParams, Link } from "wouter";
import { ChevronLeft, Clock, Box, Truck, CheckCircle, Package } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";

const STEPS = [
  { key: "pending", label: "زیرِ التواء", sublabel: "Order received", icon: Clock },
  { key: "packed", label: "پیک ہوگیا", sublabel: "Packed & ready", icon: Box },
  { key: "on_the_way", label: "راستے میں", sublabel: "Out for delivery", icon: Truck },
  { key: "delivered", label: "پہنچ گیا", sublabel: "Delivered", icon: CheckCircle },
];

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

export default function Track() {
  const params = useParams<{ trackingNumber: string }>();
  const trackingNumber = params.trackingNumber || "";
  
  const { data: order, isLoading, isError } = useTrackOrder(trackingNumber, {
    query: { enabled: !!trackingNumber, queryKey: getTrackOrderQueryKey(trackingNumber) }
  });

  const currentStep = order ? stepIndex(order.status) : -1;

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/orders"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="urdu-text text-2xl font-bold flex-1 text-right">آرڈر ٹریکنگ</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-48 rounded-xl" />
          </div>
        ) : isError || !order ? (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="urdu-text text-muted-foreground font-bold text-lg">آرڈر نہیں ملا</p>
            <p className="text-sm text-muted-foreground mt-1">Order "{trackingNumber}" not found.</p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Order Info Card */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="text-right mb-3">
                <p className="font-mono text-xl font-bold text-primary">{order.trackingNumber}</p>
                <p className="text-sm text-muted-foreground urdu-text">{order.customerName} — {order.customerPhone}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm"><span className="text-muted-foreground">Address: </span>{order.address}</p>
                <p className="text-sm"><span className="text-muted-foreground urdu-text">کل رقم: </span><span className="font-bold">Rs. {order.total}</span></p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="bg-card border rounded-xl p-4">
              <h2 className="urdu-text text-lg font-bold text-right mb-4">آرڈر کی صورتحال</h2>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
                <div
                  className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-700"
                  style={{ height: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : "0%" }}
                />
                <div className="flex flex-col gap-6">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-background border-muted text-muted-foreground"} ${active ? "scale-110 shadow-primary/30 shadow-lg" : ""}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className={`urdu-text font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                          <p className={`text-xs ${done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{step.sublabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border rounded-xl p-4">
              <h2 className="urdu-text text-lg font-bold text-right mb-3">آرڈر کی تفصیل</h2>
              <div className="flex flex-col gap-2">
                {(order.items as Array<{ productNameUrdu: string; productName: string; quantity: number; unit: string; price: number }>).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
                    <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                    <span className="urdu-text">{item.productNameUrdu} × {item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
