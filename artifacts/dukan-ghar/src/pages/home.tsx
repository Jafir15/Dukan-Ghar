import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ChevronRight, MapPin, Search as SearchIcon } from "lucide-react";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: isLoadingCategories } = useListCategories({ type: "product" });
  const { data: featuredProducts, isLoading: isLoadingProducts } = useListProducts({ featured: true });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTrackOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const track = formData.get("tracking") as string;
    if (track.trim()) {
      setLocation(`/track/${encodeURIComponent(track)}`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..." 
            className="w-full pl-10 h-12 rounded-xl border-primary/20 focus-visible:ring-primary shadow-sm"
          />
          <Search className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
        </form>

        {/* Track Order Quick Action */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <h2 className="urdu-text text-xl font-bold text-primary-foreground/90 dark:text-primary mb-2 text-right">اپنا آرڈر ٹریک کریں</h2>
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <Button type="submit" className="shrink-0 rounded-lg">
              <MapPin className="w-4 h-4 mr-2" /> Track
            </Button>
            <Input name="tracking" placeholder="Tracking Number..." className="bg-background rounded-lg flex-1" />
          </form>
        </div>

        {/* Categories */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
            <h2 className="urdu-text text-2xl font-bold">زمرہ جات</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {isLoadingCategories ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <Skeleton className="w-12 h-3" />
                </div>
              ))
            ) : categories?.length === 0 ? (
              <div className="col-span-4 text-center py-6 text-muted-foreground text-sm">No categories found.</div>
            ) : (
              categories?.map(category => (
                <Link key={category.id} href={`/category/${category.id}`} className="flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-square bg-card border rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-2 group-hover:border-primary transition-colors hover-elevate">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain" />
                    ) : category.icon ? (
                      <span className="text-3xl">{category.icon}</span>
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full" />
                    )}
                  </div>
                  <span className="urdu-text text-center text-sm font-medium leading-tight">{category.nameUrdu}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center">
              More <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
            <h2 className="urdu-text text-2xl font-bold">نمایاں مصنوعات</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {isLoadingProducts ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-xl" />
              ))
            ) : featuredProducts?.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">No featured products.</div>
            ) : (
              featuredProducts?.map(product => (
                <Link key={product.id} href={`/products?search=${encodeURIComponent(product.name)}`} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col hover-elevate group">
                  <div className="aspect-square bg-muted/30 p-4 relative flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-full" />
                    )}
                    <Badge className="absolute top-2 right-2 shadow-sm pointer-events-none" variant="secondary">
                      Rs. {product.price}
                    </Badge>
                  </div>
                  <div className="p-3 pt-2 text-right flex flex-col flex-1 justify-between">
                    <h3 className="urdu-text text-lg font-bold leading-tight mb-1">{product.nameUrdu}</h3>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-muted-foreground">/{product.unit}</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
