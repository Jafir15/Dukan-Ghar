import React from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Truck, MapPin, Package, Home, Moon, Sun, ClipboardList } from "lucide-react";
import { useCart } from "./cart-context";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-[430px] min-h-[100dvh] bg-background shadow-2xl relative flex flex-col sm:border-x">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground px-4 py-3 shadow-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline text-primary-foreground">
          <span className="text-2xl font-bold tracking-tight urdu-text leading-none mt-1">دکان گھر</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full w-9 h-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Link href="/track" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">
            <MapPin size={22} />
          </Link>
          <Link href="/cart" className="relative text-primary-foreground hover:text-primary-foreground/80 transition-colors">
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 flex flex-col">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-[430px] bg-card border-t border-border flex justify-between px-2 py-2 pb-safe z-50 rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <BottomNavItem href="/" icon={<Home size={22} />} label="Home" active={location === "/"} />
        <BottomNavItem href="/products" icon={<Package size={22} />} label="Products" active={location === "/products" || location.startsWith("/category")} />
        <BottomNavItem href="/transport" icon={<Truck size={22} />} label="Transport" active={location === "/transport"} />
        <BottomNavItem href="/orders" icon={<ClipboardList size={22} />} label="Orders" active={location === "/orders"} />
        <BottomNavItem href="/cart" icon={<ShoppingBag size={22} />} label="Cart" active={location === "/cart"} badge={totalItems} />
      </nav>
    </div>
  );
}

function BottomNavItem({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active: boolean; badge?: number }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-16 h-14 relative rounded-xl transition-all duration-200 ${active ? "text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
      <div className={`mb-1 transition-transform duration-200 ${active ? "scale-110" : ""}`}>
        {icon}
      </div>
      <span className="text-[10px]">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-3 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute -bottom-2 w-8 h-1 bg-primary rounded-t-full" />
      )}
    </Link>
  );
}
