import { useState } from "react";
import { useListVehicles, useCreateBooking, useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Clock, CheckCircle, X, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSessionId } from "@/lib/session";
import { useQueryClient } from "@tanstack/react-query";

const VEHICLE_TYPES: Record<string, string> = {
  rickshaw: "رکشہ",
  chigchi: "چنگچی",
  carry_bolan: "کیری بولان",
  car: "گاڑی",
  high_roof: "ہائی روف",
  bus: "بس",
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "زیرِ غور", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "تصدیق شدہ", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "مکمل", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "منسوخ", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function Transport() {
  const { data: vehicles, isLoading } = useListVehicles({});
  const { data: bookings } = useListBookings({ sessionId: getSessionId() });
  const createBooking = useCreateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [passengersDetail, setPassengersDetail] = useState("");
  const [luggageDetail, setLuggageDetail] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const handleBook = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !customerName || !customerPhone || !passengersDetail || !luggageDetail) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    createBooking.mutate(
      {
        data: {
          sessionId: getSessionId(),
          vehicleId: selectedVehicle,
          customerName,
          customerPhone,
          passengersDetail,
          luggageDetail,
          pickupAddress: pickupAddress || null,
          dropoffAddress: dropoffAddress || null,
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setCustomerName(""); setCustomerPhone(""); setPassengersDetail(""); setLuggageDetail(""); setPickupAddress(""); setDropoffAddress("");
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
          toast({ title: "Booking Confirmed!", description: "We will contact you shortly." });
        },
        onError: () => {
          toast({ title: "Booking failed", variant: "destructive" });
        },
      }
    );
  };

  const vehicle = vehicles?.find(v => v.id === selectedVehicle);

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-5">
        <h1 className="urdu-text text-2xl font-bold text-right">ٹرانسپورٹ سروس</h1>

        {/* Vehicle Grid */}
        <section>
          <h2 className="urdu-text text-lg font-semibold text-right mb-3 text-muted-foreground">دستیاب گاڑیاں</h2>
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-40 rounded-xl" />)
            ) : (
              vehicles?.map(v => (
                <div
                  key={v.id}
                  data-testid={`card-vehicle-${v.id}`}
                  onClick={() => handleBook(v.id)}
                  className="bg-card border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover-elevate hover:border-primary/40 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-full aspect-square bg-muted/20 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/5 transition-colors">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} className="w-full h-full object-contain p-4" />
                    ) : (
                      <Truck className="w-12 h-12 text-primary/40" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="urdu-text text-xl font-bold leading-tight">{VEHICLE_TYPES[v.type] || v.nameUrdu}</p>
                    <p className="text-xs text-muted-foreground">{v.name}</p>
                    <p className="font-semibold text-primary mt-1">Rs. {v.baseRent}+</p>
                  </div>
                  <div className="w-full h-9 mt-1 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-medium">
                    <span className="urdu-text">بک کریں</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Booking History */}
        {bookings && bookings.length > 0 && (
          <section>
            <h2 className="urdu-text text-lg font-semibold text-right mb-3 text-muted-foreground">میری بکنگز</h2>
            <div className="flex flex-col gap-3">
              {bookings.map(b => {
                const status = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pending;
                return (
                  <div key={b.id} data-testid={`card-booking-${b.id}`} className="bg-card border rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full urdu-text ${status.color}`}>{status.label}</span>
                      <div className="text-right">
                        <p className="urdu-text font-bold text-base">{VEHICLE_TYPES[b.vehicleType] || b.vehicleNameUrdu}</p>
                        <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("ur-PK")}</p>
                      </div>
                    </div>
                    {b.adminAddress && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mt-2 text-right">
                        <p className="text-xs text-muted-foreground urdu-text">ایڈمن کا پتہ:</p>
                        <p className="text-sm font-medium">{b.adminAddress}</p>
                      </div>
                    )}
                    {b.agreedRent != null && (
                      <div className="text-right mt-1">
                        <p className="text-sm"><span className="text-muted-foreground urdu-text">متفقہ کرایہ: </span><span className="font-bold">Rs. {b.agreedRent}</span></p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="mx-auto max-w-[400px] w-[95vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="urdu-text text-xl text-right">
              {vehicle ? (VEHICLE_TYPES[vehicle.type] || vehicle.nameUrdu) : ""} بک کریں
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-1">
              <Label className="urdu-text text-right block">نام *</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="آپ کا نام" className="text-right" required />
            </div>
            <div className="space-y-1">
              <Label className="urdu-text text-right block">موبائل نمبر *</Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="03001234567" type="tel" required />
            </div>
            <div className="space-y-1">
              <Label className="urdu-text text-right block">سواریوں/بچوں کی تفصیل *</Label>
              <Textarea value={passengersDetail} onChange={e => setPassengersDetail(e.target.value)} placeholder="کتنے لوگ، عمریں..." className="text-right resize-none" rows={2} required />
            </div>
            <div className="space-y-1">
              <Label className="urdu-text text-right block">سامان کی تفصیل *</Label>
              <Textarea value={luggageDetail} onChange={e => setLuggageDetail(e.target.value)} placeholder="سامان کی تفصیل..." className="text-right resize-none" rows={2} required />
            </div>
            <div className="space-y-1">
              <Label className="urdu-text text-right block">روانگی کا پتہ</Label>
              <Input value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="کہاں سے" className="text-right" />
            </div>
            <div className="space-y-1">
              <Label className="urdu-text text-right block">منزل کا پتہ</Label>
              <Input value={dropoffAddress} onChange={e => setDropoffAddress(e.target.value)} placeholder="کہاں جانا ہے" className="text-right" />
            </div>
            <Button type="submit" disabled={createBooking.isPending} className="w-full h-12 text-base font-bold rounded-xl mt-2">
              {createBooking.isPending ? "Booking..." : <span className="urdu-text">بکنگ کی تصدیق کریں</span>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
