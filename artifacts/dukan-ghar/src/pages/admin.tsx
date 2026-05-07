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
import { ShieldCheck, BarChart3, Package, Tag, Truck, ClipboardList, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [name, setName] = useState(""); const [nameUrdu, setNameUrdu] = useState(""); const [price, setPrice] = useState(""); const [unit, setUnit] = useState("kg"); const [stock, setStock] = useState("10"); const [catId, setCatId] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({ data: { name, nameUrdu, price: Number(price), unit: unit as "kg" | "gram" | "liter" | "pound" | "piece", stock: Number(stock), categoryId: catId ? Number(catId) : null, featured: false } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setName(""); setNameUrdu(""); setPrice(""); setStock("10"); toast({ title: "Product added!" }); },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">مصنوعات مینجمنٹ</h2>
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">Add New Product</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name (English)" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام (اردو)" className="text-right urdu-text" required />
          <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" type="number" required />
          <Input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={unit} onValueChange={setUnit}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
          <Select value={catId} onValueChange={setCatId}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button type="submit" disabled={createProduct.isPending} size="sm">Add Product</Button>
      </form>
      <div className="flex flex-col gap-2">
        {products?.map(p => (
          <div key={p.id} className="bg-card border rounded-xl p-3 flex items-center justify-between shadow-sm">
            <Button variant="destructive" size="sm" onClick={() => { deleteProduct.mutate({ id: p.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) }); }}>Del</Button>
            <div className="text-right"><p className="font-medium text-sm">{p.name}</p><p className="urdu-text text-xs text-muted-foreground">{p.nameUrdu}</p><p className="text-xs">Rs. {p.price} / {p.unit}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories() {
  const { data: categories } = useListCategories({});
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState(""); const [nameUrdu, setNameUrdu] = useState(""); const [type, setType] = useState<"product" | "vehicle">("product");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({ data: { name, nameUrdu, type } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setName(""); setNameUrdu(""); toast({ title: "Category added!" }); },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">زمرہ مینجمنٹ</h2>
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">Add Category</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام" className="text-right urdu-text" required />
        </div>
        <Select value={type} onValueChange={v => setType(v as "product" | "vehicle")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="vehicle">Vehicle</SelectItem></SelectContent></Select>
        <Button type="submit" size="sm" disabled={createCategory.isPending}>Add</Button>
      </form>
      <div className="flex flex-col gap-2">
        {categories?.map(c => (
          <div key={c.id} className="bg-card border rounded-xl p-3 flex items-center justify-between shadow-sm">
            <Button variant="destructive" size="sm" onClick={() => deleteCategory.mutate({ id: c.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }) })}>Del</Button>
            <div className="text-right"><p className="font-medium text-sm">{c.name}</p><p className="urdu-text text-xs text-muted-foreground">{c.nameUrdu}</p><Badge variant="outline" className="text-xs">{c.type}</Badge></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminVehicles() {
  const { data: vehicles } = useListVehicles({});
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState(""); const [nameUrdu, setNameUrdu] = useState(""); const [type, setType] = useState("rickshaw"); const [rent, setRent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicle.mutate({ data: { name, nameUrdu, type: type as "rickshaw" | "chigchi" | "carry_bolan" | "car" | "high_roof" | "bus", baseRent: Number(rent) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() }); setName(""); setNameUrdu(""); setRent(""); toast({ title: "Vehicle added!" }); },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="urdu-text text-xl font-bold text-right">گاڑی مینجمنٹ</h2>
      <form onSubmit={handleCreate} className="bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold text-sm">Add Vehicle</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
          <Input value={nameUrdu} onChange={e => setNameUrdu(e.target.value)} placeholder="نام" className="urdu-text text-right" required />
          <Input value={rent} onChange={e => setRent(e.target.value)} placeholder="Base Rent" type="number" required />
          <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button type="submit" size="sm" disabled={createVehicle.isPending}>Add</Button>
      </form>
      <div className="flex flex-col gap-2">
        {vehicles?.map(v => (
          <div key={v.id} className="bg-card border rounded-xl p-3 flex items-center justify-between shadow-sm">
            <Button variant="destructive" size="sm" onClick={() => deleteVehicle.mutate({ id: v.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() }) })}>Del</Button>
            <div className="text-right"><p className="font-medium text-sm">{v.name}</p><p className="urdu-text text-xs text-muted-foreground">{v.nameUrdu}</p><p className="text-xs">Rs. {v.baseRent}+ | {v.type}</p></div>
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
