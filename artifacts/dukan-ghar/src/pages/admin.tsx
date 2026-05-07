import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useVerifyAdminPin, useGetDashboardStats, getGetDashboardStatsQueryKey,
  useListOrders, getListOrdersQueryKey, useUpdateOrder,
  useListProducts, getListProductsQueryKey, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, getListCategoriesQueryKey, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useListVehicles, getListVehiclesQueryKey, useCreateVehicle, useUpdateVehicle, useDeleteVehicle,
  useListBookings, getListBookingsQueryKey, useUpdateBooking,
  useListPaymentMethods, getListPaymentMethodsQueryKey, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, BarChart3, Package, Tag, Truck, ClipboardList, CreditCard, ImageIcon, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ImageEditRow({ currentUrl, onSave, isPending }: { currentUrl: string | null | undefined; onSave: (url: string | null) => void; isPending: boolean }) {
  const [url, setUrl] = useState(currentUrl || "");
  return (
    <div className="flex flex-col gap-2 border-t pt-3 mt-1 bg-muted/30 rounded-lg p-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL (paste link)</p>
      {url && (
        <div className="w-full h-32 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
          <img src={url} alt="preview" className="h-full w-full object-contain" onError={e => (e.currentTarget.style.display = "none")} />
        </div>
      )}
      <Input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="text-xs"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(url || null)} disabled={isPending} className="h-7 text-xs gap-1">
          <Check className="w-3 h-3" /> Save Image
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onSave(null)} disabled={isPending} className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
          <X className="w-3 h-3" /> Remove
        </Button>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ["pending", "packed", "on_the_way", "delivered"];
const STATUS_LABELS: Record<string, string> = { pending: "زیرِ التواء", packed: "پیک ہوگیا", on_the_way: "راستے میں", delivered: "پہنچ گیا" };
const BOOKING_STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];
const BOOKING_STATUS_LABELS: Record<string, string> = { pending: "زیرِ غور", confirmed: "تصدیق شدہ", completed: "مکمل", cancelled: "منسوخ" };
const UNIT_OPTIONS = ["kg", "gram", "liter", "pound", "piece"];
const VEHICLE_TYPES = ["rickshaw", "chigchi", "carry_bolan", "car", "high_roof", "bus"];

export default function Admin() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem("admin_token"));
  const verifyPin = useVerifyAdminPin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin.mutate({ data: { pin } }, {
      onSuccess: (data) => {
        if (data.success) {
          sessionStorage.setItem("admin_token", data.token);
          setIsAuthenticated(true);
        }
      },
      onError: () => toast({ title: "Invalid PIN", variant: "destructive" }),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-card border rounded-2xl p-8 w-full max-w-[320px] shadow-xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="urdu-text text-2xl font-bold mb-1">ایڈمن پینل</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter admin PIN to continue</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter PIN" className="text-center text-2xl tracking-widest h-14 rounded-xl" maxLength={6} data-testid="input-admin-pin" />
            <Button type="submit" disabled={verifyPin.isPending} className="h-12 rounded-xl font-bold text-lg">
              {verifyPin.isPending ? "Verifying..." : <span className="urdu-text">داخل ہوں</span>}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => { sessionStorage.removeItem("admin_token"); setIsAuthenticated(false); }} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-md">
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-primary-foreground hover:bg-primary-foreground/20 rounded-lg text-xs">Logout</Button>
        <h1 className="urdu-text text-xl font-bold">ایڈمن پینل</h1>
      </header>

      <div className="max-w-[900px] mx-auto p-4">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 bg-muted p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg text-xs gap-1"><BarChart3 className="w-3.5 h-3.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg text-xs gap-1"><ClipboardList className="w-3.5 h-3.5" />Orders</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-xs gap-1"><Package className="w-3.5 h-3.5" />Products</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg text-xs gap-1"><Tag className="w-3.5 h-3.5" />Categories</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-lg text-xs gap-1"><Truck className="w-3.5 h-3.5" />Vehicles</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg text-xs gap-1"><Truck className="w-3.5 h-3.5" />Bookings</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg text-xs gap-1"><CreditCard className="w-3.5 h-3.5" />Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total Orders", value: stats?.totalOrders ?? "—", urdu: "کل آرڈر" },
                { label: "Revenue", value: `Rs. ${stats?.totalRevenue?.toFixed(0) ?? "—"}`, urdu: "آمدنی" },
                { label: "Pending Orders", value: stats?.pendingOrders ?? "—", urdu: "زیرِ التواء" },
                { label: "Delivered", value: stats?.deliveredOrders ?? "—", urdu: "پہنچائے گئے" },
                { label: "Total Bookings", value: stats?.totalBookings ?? "—", urdu: "بکنگز" },
                { label: "Total Products", value: stats?.totalProducts ?? "—", urdu: "مصنوعات" },
              ].map((s) => (
                <div key={s.label} className="bg-card border rounded-xl p-4 text-right shadow-sm">
                  <p className="text-2xl font-bold text-primary">{statsLoading ? "..." : s.value}</p>
                  <p className="urdu-text text-sm text-muted-foreground">{s.urdu}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="categories"><AdminCategories /></TabsContent>
          <TabsContent value="vehicles"><AdminVehicles /></TabsContent>
          <TabsContent value="bookings"><AdminBookings /></TabsContent>
          <TabsContent value="payments"><AdminPayments /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminOrders() {
  const { data: orders } = useListOrders({});
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateOrder.mutate({ id, data: { status: status as "pending" | "packed" | "on_the_way" | "delivered" } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }); toast({ title: "Status updated" }); },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="urdu-text text-xl font-bold text-right">آرڈر مینجمنٹ</h2>
      {orders?.map(o => (
        <div key={o.id} className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <Select defaultValue={o.status} onValueChange={v => handleStatusChange(o.id, v)}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}><span className="urdu-text text-xs">{STATUS_LABELS[s]}</span></SelectItem>)}</SelectContent>
            </Select>
            <div className="text-right">
              <p className="font-mono font-bold text-primary">{o.trackingNumber}</p>
              <p className="text-xs text-muted-foreground">{o.customerName} — {o.customerPhone}</p>
            </div>
          </div>
          <div className="text-right text-sm"><span className="text-muted-foreground">Total: </span><span className="font-bold">Rs. {o.total}</span></div>
        </div>
      ))}
    </div>
  );
}

function AdminProducts() {
  const { data: products } = useListProducts({});
  const { data: categories } = useListCategories({ type: "product" });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("10");
  const [catId, setCatId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [expandedImg, setExpandedImg] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      data: {
        name, nameUrdu, price: Number(price),
        unit: unit as "kg" | "gram" | "liter" | "pound" | "piece",
        stock: Number(stock),
        categoryId: catId ? Number(catId) : null,
        featured: false,
        imageUrl: imageUrl || null,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setName(""); setNameUrdu(""); setPrice(""); setStock("10"); setImageUrl("");
        toast({ title: "Product added!" });
      },
    });
  };

  const handleSaveImage = (id: number, url: string | null) => {
    updateProduct.mutate({ id, data: { imageUrl: url } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setExpandedImg(null);
        toast({ title: url ? "تصویر محفوظ ہو گئی!" : "تصویر ہٹا دی گئی" });
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">مصنوعات مینجمنٹ</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">نئی مصنوعہ شامل کریں</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name (English)" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام (اردو)" className="text-right urdu-text" required />
          <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (Rs.)" type="number" required />
          <Input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={catId} onValueChange={setCatId}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* Image URL for new product */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> تصویر کا لنک (اختیاری)</p>
          <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="text-xs" />
          {imageUrl && (
            <div className="w-full h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
              <img src={imageUrl} alt="preview" className="h-full w-full object-contain" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>
        <Button type="submit" disabled={createProduct.isPending} size="sm">Add Product</Button>
      </form>

      {/* Product List */}
      <div className="flex flex-col gap-2">
        {products?.map(p => (
          <div key={p.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-3">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-muted/40 border flex items-center justify-center shrink-0 overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  : <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="urdu-text text-xs text-muted-foreground truncate">{p.nameUrdu}</p>
                <p className="text-xs text-primary font-semibold">Rs. {p.price} / {p.unit}</p>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 w-full"
                  onClick={() => setExpandedImg(expandedImg === p.id ? null : p.id)}
                >
                  <ImageIcon className="w-3 h-3" />
                  {p.imageUrl ? "Edit" : "Add"} Pic
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={() => deleteProduct.mutate({ id: p.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) })}
                >
                  Delete
                </Button>
              </div>
            </div>
            {/* Inline image edit panel */}
            {expandedImg === p.id && (
              <div className="px-3 pb-3">
                <ImageEditRow
                  currentUrl={p.imageUrl}
                  onSave={(url) => handleSaveImage(p.id, url)}
                  isPending={updateProduct.isPending}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories() {
  const { data: categories } = useListCategories({});
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [type, setType] = useState<"product" | "vehicle">("product");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [expandedIcon, setExpandedIcon] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({ data: { name, nameUrdu, type, icon: icon || null, imageUrl: imageUrl || null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setName(""); setNameUrdu(""); setIcon(""); setImageUrl("");
        toast({ title: "Category added!" });
      },
    });
  };

  const handleSaveIcon = (id: number, newIcon: string | null, newImageUrl: string | null) => {
    updateCategory.mutate({ id, data: { icon: newIcon, imageUrl: newImageUrl } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setExpandedIcon(null);
        toast({ title: "زمرہ اپڈیٹ ہو گیا!" });
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">زمرہ مینجمنٹ</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">نیا زمرہ شامل کریں</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name (English)" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام (اردو)" className="text-right urdu-text" required />
        </div>
        <Select value={type} onValueChange={v => setType(v as "product" | "vehicle")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="vehicle">Vehicle</SelectItem></SelectContent>
        </Select>
        {/* Icon & Image inputs */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> آئیکن (emoji) یا تصویر کا لنک</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Emoji آئیکن</p>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🥦 🛺 🐄" className="text-center text-xl" maxLength={4} />
            </div>
            <div className="flex flex-col gap-1">
              {icon && <span className="text-4xl text-center">{icon}</span>}
            </div>
          </div>
          <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="یا تصویر کا URL paste کریں" className="text-xs" />
          {imageUrl && (
            <div className="w-full h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
              <img src={imageUrl} alt="preview" className="h-full w-full object-contain" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>
        <Button type="submit" size="sm" disabled={createCategory.isPending}>Add Category</Button>
      </form>

      {/* Category List */}
      <div className="flex flex-col gap-2">
        {categories?.map(c => (
          <div key={c.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-3">
              {/* Icon / Image preview */}
              <div className="w-14 h-14 rounded-xl bg-muted/40 border flex items-center justify-center shrink-0 overflow-hidden">
                {c.imageUrl
                  ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  : c.icon
                    ? <span className="text-3xl">{c.icon}</span>
                    : <Tag className="w-5 h-5 text-muted-foreground/40" />
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="urdu-text text-xs text-muted-foreground truncate">{c.nameUrdu}</p>
                <Badge variant="outline" className="text-xs">{c.type}</Badge>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 w-full"
                  onClick={() => setExpandedIcon(expandedIcon === c.id ? null : c.id)}
                >
                  <ImageIcon className="w-3 h-3" />
                  {c.icon || c.imageUrl ? "Edit" : "Add"} Icon
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={() => deleteCategory.mutate({ id: c.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }) })}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Inline icon/image edit panel */}
            {expandedIcon === c.id && (
              <CategoryIconEdit
                currentIcon={c.icon}
                currentImageUrl={c.imageUrl}
                onSave={(newIcon, newImageUrl) => handleSaveIcon(c.id, newIcon, newImageUrl)}
                isPending={updateCategory.isPending}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryIconEdit({ currentIcon, currentImageUrl, onSave, isPending }: {
  currentIcon: string | null | undefined;
  currentImageUrl: string | null | undefined;
  onSave: (icon: string | null, imageUrl: string | null) => void;
  isPending: boolean;
}) {
  const [icon, setIcon] = useState(currentIcon || "");
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  return (
    <div className="flex flex-col gap-3 border-t bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> آئیکن یا تصویر تبدیل کریں</p>
      {/* Emoji icon */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Emoji آئیکن (مثلاً 🥦 🛺)</p>
          <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Emoji paste کریں" className="text-center text-xl" maxLength={4} />
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
      {/* Image URL */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">یا تصویر کا URL</p>
        <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/icon.png" className="text-xs" />
        {imageUrl && (
          <div className="w-full h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center border mt-2">
            <img src={imageUrl} alt="preview" className="h-full w-full object-contain" onError={e => (e.currentTarget.style.display = "none")} />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(icon || null, imageUrl || null)} disabled={isPending} className="h-7 text-xs gap-1">
          <Check className="w-3 h-3" /> محفوظ کریں
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onSave(null, null)} disabled={isPending} className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
          <X className="w-3 h-3" /> ہٹائیں
        </Button>
      </div>
    </div>
  );
}

function AdminVehicles() {
  const { data: vehicles } = useListVehicles({});
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [type, setType] = useState("rickshaw");
  const [rent, setRent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [expandedImg, setExpandedImg] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicle.mutate({
      data: {
        name, nameUrdu,
        type: type as "rickshaw" | "chigchi" | "carry_bolan" | "car" | "high_roof" | "bus",
        baseRent: Number(rent),
        imageUrl: imageUrl || null,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
        setName(""); setNameUrdu(""); setRent(""); setImageUrl("");
        toast({ title: "Vehicle added!" });
      },
    });
  };

  const handleSaveImage = (id: number, url: string | null) => {
    updateVehicle.mutate({ id, data: { imageUrl: url } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
        setExpandedImg(null);
        toast({ title: url ? "تصویر محفوظ ہو گئی!" : "تصویر ہٹا دی گئی" });
      },
    });
  };

  const VEHICLE_TYPE_URDU: Record<string, string> = {
    rickshaw: "رکشہ", chigchi: "چنگچی", carry_bolan: "کیری بولان",
    car: "گاڑی", high_roof: "ہائی روف", bus: "بس",
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">گاڑی مینجمنٹ</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">نئی گاڑی شامل کریں</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name (English)" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام (اردو)" className="urdu-text text-right" required />
          <Input value={rent} onChange={e => setRent(e.target.value)} placeholder="Base Rent (Rs.)" type="number" required />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{VEHICLE_TYPE_URDU[t] || t} ({t})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* Image URL for new vehicle */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> تصویر کا لنک (اختیاری)</p>
          <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/vehicle.jpg" className="text-xs" />
          {imageUrl && (
            <div className="w-full h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
              <img src={imageUrl} alt="preview" className="h-full w-full object-contain" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>
        <Button type="submit" size="sm" disabled={createVehicle.isPending}>Add Vehicle</Button>
      </form>

      {/* Vehicle List */}
      <div className="flex flex-col gap-2">
        {vehicles?.map(v => (
          <div key={v.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-3">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-muted/40 border flex items-center justify-center shrink-0 overflow-hidden">
                {v.imageUrl
                  ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                  : <Truck className="w-5 h-5 text-muted-foreground/40" />
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <p className="font-medium text-sm truncate">{v.name}</p>
                <p className="urdu-text text-xs text-muted-foreground truncate">{v.nameUrdu}</p>
                <p className="text-xs text-primary font-semibold">Rs. {v.baseRent}+ | {v.type}</p>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 w-full"
                  onClick={() => setExpandedImg(expandedImg === v.id ? null : v.id)}
                >
                  <ImageIcon className="w-3 h-3" />
                  {v.imageUrl ? "Edit" : "Add"} Pic
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={() => deleteVehicle.mutate({ id: v.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() }) })}
                >
                  Delete
                </Button>
              </div>
            </div>
            {/* Inline image edit panel */}
            {expandedImg === v.id && (
              <div className="px-3 pb-3">
                <ImageEditRow
                  currentUrl={v.imageUrl}
                  onSave={(url) => handleSaveImage(v.id, url)}
                  isPending={updateVehicle.isPending}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBookings() {
  const { data: bookings } = useListBookings({});
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<number, { adminAddress: string; agreedRent: string }>>({});

  const startEdit = (id: number, current: { adminAddress: string | null; agreedRent: number | null }) => {
    setEditing(prev => ({ ...prev, [id]: { adminAddress: current.adminAddress || "", agreedRent: current.agreedRent?.toString() || "" } }));
  };

  const saveEdit = (id: number) => {
    const e = editing[id];
    if (!e) return;
    updateBooking.mutate({ id, data: { adminAddress: e.adminAddress || null, agreedRent: e.agreedRent ? Number(e.agreedRent) : null } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }); setEditing(prev => { const n = { ...prev }; delete n[id]; return n; }); toast({ title: "Booking updated!" }); },
    });
  };

  const handleStatusChange = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status: status as "pending" | "confirmed" | "completed" | "cancelled" } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="urdu-text text-xl font-bold text-right">بکنگ مینجمنٹ</h2>
      {bookings?.map(b => (
        <div key={b.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <Select defaultValue={b.status} onValueChange={v => handleStatusChange(b.id, v)}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{BOOKING_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}><span className="urdu-text text-xs">{BOOKING_STATUS_LABELS[s]}</span></SelectItem>)}</SelectContent>
            </Select>
            <div className="text-right">
              <p className="font-bold urdu-text">{b.vehicleNameUrdu}</p>
              <p className="text-xs text-muted-foreground">{b.customerName} — {b.customerPhone}</p>
            </div>
          </div>
          <div className="text-right text-sm space-y-1">
            <p><span className="text-muted-foreground urdu-text">سواریاں: </span>{b.passengersDetail}</p>
            <p><span className="text-muted-foreground urdu-text">سامان: </span>{b.luggageDetail}</p>
          </div>
          {editing[b.id] ? (
            <div className="flex flex-col gap-2 border-t pt-3">
              <Input value={editing[b.id].adminAddress} onChange={e => setEditing(prev => ({ ...prev, [b.id]: { ...prev[b.id], adminAddress: e.target.value } }))} placeholder="Admin Address" className="text-right" />
              <Input value={editing[b.id].agreedRent} onChange={e => setEditing(prev => ({ ...prev, [b.id]: { ...prev[b.id], agreedRent: e.target.value } }))} placeholder="Agreed Rent (Rs.)" type="number" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(b.id)} disabled={updateBooking.isPending}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(prev => { const n = { ...prev }; delete n[b.id]; return n; })}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => startEdit(b.id, { adminAddress: b.adminAddress, agreedRent: b.agreedRent })}>Edit Address & Rent</Button>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminPayments() {
  const { data: methods } = useListPaymentMethods();
  const createPM = useCreatePaymentMethod();
  const updatePM = useUpdatePaymentMethod();
  const deletePM = useDeletePaymentMethod();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bank, setBank] = useState(""); const [account, setAccount] = useState(""); const [holder, setHolder] = useState(""); const [logo, setLogo] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPM.mutate({ data: { bankName: bank, accountNumber: account, holderName: holder, logoUrl: logo || null, active: true } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() }); setBank(""); setAccount(""); setHolder(""); setLogo(""); toast({ title: "Payment method added!" }); },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">ادائیگی طریقے</h2>
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">Add Payment Method</h3>
        <Input value={bank} onChange={e => setBank(e.target.value)} placeholder="Bank Name (e.g. JazzCash)" required />
        <Input value={account} onChange={e => setAccount(e.target.value)} placeholder="Account Number" required />
        <Input value={holder} onChange={e => setHolder(e.target.value)} placeholder="Holder Name" required />
        <Input value={logo} onChange={e => setLogo(e.target.value)} placeholder="Logo URL (optional)" />
        <Button type="submit" size="sm" disabled={createPM.isPending}>Add</Button>
      </form>
      <div className="flex flex-col gap-3">
        {methods?.map(m => (
          <div key={m.id} className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={() => deletePM.mutate({ id: m.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() }) })}>Del</Button>
              <Button variant="outline" size="sm" onClick={() => updatePM.mutate({ id: m.id, data: { active: !m.active } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() }) })}>{m.active ? "Disable" : "Enable"}</Button>
            </div>
            <div className="text-right">
              {m.logoUrl && <img src={m.logoUrl} alt={m.bankName} className="h-6 ml-auto mb-1 object-contain" />}
              <p className="font-bold text-sm">{m.bankName}</p>
              <p className="text-xs text-muted-foreground">{m.holderName} — {m.accountNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
