import { useState } from "react";
import { useLocation } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCreateOrder, useListPaymentMethods } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalWeight } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: paymentMethods } = useListPaymentMethods();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState<"07:00" | "11:00" | "16:00">("11:00");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const deliveryCharge = totalWeight <= 8 ? 50 : 50 + Math.ceil(totalWeight - 8) * 10;
  const total = totalPrice + deliveryCharge;

  const slotLabels: Record<string, string> = {
    "07:00": "7:00 صبح",
    "11:00": "11:00 دوپہر",
    "16:00": "4:00 شام",
  };

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone || !address) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before ordering." });
      return;
    }
    createOrder.mutate(
      {
        data: {
          sessionId: getSessionId(),
          customerName,
          customerPhone,
          address,
          deliverySlot,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productNameUrdu: item.product.nameUrdu,
            quantity: item.quantity,
            unit: item.product.unit,
            price: item.product.price,
          })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/checkout/success?tracking=${order.trackingNumber}`);
        },
        onError: () => {
          toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-primary/60" />
          </div>
          <h2 className="urdu-text text-2xl font-bold mb-2">کارٹ خالی ہے</h2>
          <p className="text-muted-foreground text-sm mb-6">Your cart is empty. Add some products!</p>
          <Button asChild className="rounded-xl px-8">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="urdu-text text-2xl font-bold flex-1 text-right">آپ کا کارٹ</h1>
        </div>

        {/* Cart Items */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.product.id} className="bg-card border rounded-xl p-3 flex gap-3 shadow-sm">
              <div className="w-20 h-20 bg-muted/20 rounded-lg flex items-center justify-center shrink-0">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="text-right">
                  <h3 className="urdu-text text-lg font-bold leading-tight">{item.product.nameUrdu}</h3>
                  <p className="text-xs text-muted-foreground">{item.product.name}</p>
                  <p className="font-semibold text-sm mt-0.5">Rs. {(item.product.price * item.quantity).toFixed(0)}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:text-destructive/70 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-1 py-0.5 border">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
          <h2 className="urdu-text text-xl font-bold text-right mb-2">حساب کتاب</h2>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Rs. {totalPrice.toFixed(0)}</span>
            <span className="text-muted-foreground">Subtotal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Rs. {deliveryCharge}</span>
            <span className="text-muted-foreground urdu-text">ڈیلیوری چارجز ({totalWeight.toFixed(2)} kg)</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between font-bold">
            <span className="text-lg">Rs. {total.toFixed(0)}</span>
            <span className="urdu-text text-lg">کل رقم</span>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-card border rounded-xl p-4 flex flex-col gap-4 shadow-sm">
          <h2 className="urdu-text text-xl font-bold text-right">ترسیل کی تفصیل</h2>

          <div className="space-y-1">
            <Label className="text-right block urdu-text">نام *</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="آپ کا نام" className="text-right" data-testid="input-customer-name" />
          </div>
          <div className="space-y-1">
            <Label className="text-right block urdu-text">موبائل نمبر *</Label>
            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="03001234567" type="tel" data-testid="input-phone" />
          </div>
          <div className="space-y-1">
            <Label className="text-right block urdu-text">پتہ *</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="گھر کا پتہ" className="text-right" data-testid="input-address" />
          </div>

          <div className="space-y-1">
            <Label className="text-right block urdu-text">ڈیلیوری وقت</Label>
            <Select value={deliverySlot} onValueChange={(v) => setDeliverySlot(v as "07:00" | "11:00" | "16:00")}>
              <SelectTrigger className="text-right" data-testid="select-delivery-slot">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(slotLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    <span className="urdu-text">{l}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-right block urdu-text">ادائیگی کا طریقہ</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cod" | "online")} className="flex flex-col gap-2">
              <div className="flex items-center justify-end gap-3 bg-background rounded-lg p-3 border cursor-pointer">
                <label htmlFor="cod" className="urdu-text text-sm font-medium cursor-pointer">نقد ادائیگی (Cash on Delivery)</label>
                <RadioGroupItem value="cod" id="cod" />
              </div>
              <div className="flex items-center justify-end gap-3 bg-background rounded-lg p-3 border cursor-pointer">
                <label htmlFor="online" className="urdu-text text-sm font-medium cursor-pointer">آن لائن ادائیگی</label>
                <RadioGroupItem value="online" id="online" />
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === "online" && paymentMethods && paymentMethods.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2">
              <h3 className="urdu-text text-base font-bold text-right text-primary">بینک تفصیلات</h3>
              {paymentMethods.filter(pm => pm.active).map(pm => (
                <div key={pm.id} className="text-right space-y-1">
                  {pm.logoUrl && <img src={pm.logoUrl} alt={pm.bankName} className="h-8 ml-auto object-contain" />}
                  <p className="font-bold text-sm">{pm.bankName}</p>
                  <p className="text-sm text-muted-foreground">{pm.holderName}</p>
                  <p className="font-mono text-base font-bold">{pm.accountNumber}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={createOrder.isPending}
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg"
          data-testid="button-place-order"
        >
          {createOrder.isPending ? "Processing..." : <span className="urdu-text">آرڈر دیں</span>}
        </Button>
      </div>
    </Layout>
  );
}
