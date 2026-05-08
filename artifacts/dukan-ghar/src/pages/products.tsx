import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, Search } from "lucide-react";
import { useListProducts, Product } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveMediaUrl } from "@/lib/media";

function ProductListCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();
  const cartItem = items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} added.`,
      duration: 2000,
    });
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex items-stretch p-3 gap-3">
      <div className="w-24 h-24 bg-muted/20 rounded-lg flex items-center justify-center shrink-0">
        {resolveMediaUrl(product.imageUrl) ? (
          <img src={resolveMediaUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="w-10 h-10 bg-primary/10 rounded-full" />
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between min-w-0">
        <div className="text-right">
          <h3 className="urdu-text text-xl font-bold leading-tight truncate">{product.nameUrdu}</h3>
          <div className="text-xs text-muted-foreground mb-1 truncate">{product.name}</div>
          <div className="font-medium text-sm">
            Rs. {product.price} <span className="text-muted-foreground text-xs font-normal">/ {product.unit}</span>
          </div>
        </div>

        <div className="mt-2 ml-auto w-full sm:w-[120px]">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-secondary rounded-lg p-1 border h-9">
              <Button variant="ghost" size="icon" onClick={() => updateQuantity(product.id, quantity - 1)} className="h-7 w-7 text-secondary-foreground rounded-md hover:bg-background">
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-bold text-sm">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => updateQuantity(product.id, quantity + 1)} className="h-7 w-7 text-secondary-foreground rounded-md hover:bg-background">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleAdd} size="sm" className="w-full rounded-lg h-9">
              <ShoppingCart className="w-4 h-4 mr-2" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: products, isLoading } = useListProducts({
    search: debouncedSearch || undefined
  });

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div className="relative flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 bg-card rounded-xl border-primary/20 shadow-sm"
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 text-muted-foreground w-5 h-5" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {isLoading ? "Searching..." : `Found ${products?.length || 0} products`}
          </h2>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-full h-32 rounded-xl" />
              ))
            ) : products?.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-dashed">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground">No products match your search.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              products?.map(product => (
                <ProductListCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
