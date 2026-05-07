import { useListCategories, useListProducts, Product } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
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

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col group">
      <div className="aspect-[4/3] bg-muted/20 p-4 relative flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-16 h-16 bg-primary/10 rounded-full" />
        )}
        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground shadow-sm">
          Rs. {product.price} / {product.unit}
        </Badge>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="urdu-text text-xl font-bold leading-tight mb-1 text-right">{product.nameUrdu}</h3>
        <div className="text-sm text-muted-foreground mb-3 text-right">{product.name}</div>
        
        <div className="mt-auto">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-secondary rounded-lg p-1 border">
              <Button variant="ghost" size="icon" onClick={handleDecrease} className="h-8 w-8 text-secondary-foreground rounded-md hover:bg-background">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold w-8 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={handleIncrease} className="h-8 w-8 text-secondary-foreground rounded-md hover:bg-background">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleAdd} className="w-full rounded-lg font-bold">
              <ShoppingCart className="w-4 h-4 mr-2" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Category() {
  const params = useParams();
  const categoryId = params.id ? parseInt(params.id) : undefined;
  
  const { data: categories } = useListCategories({ type: "product" });
  const category = categories?.find(c => c.id === categoryId);
  
  const { data: products, isLoading } = useListProducts(
    { categoryId },
    { query: { enabled: !!categoryId } }
  );

  return (
    <Layout>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="rounded-full mr-2">
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div className="flex-1 text-right">
            {category ? (
              <h1 className="urdu-text text-3xl font-bold">{category.nameUrdu}</h1>
            ) : (
              <Skeleton className="w-32 h-8 ml-auto" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-[280px] rounded-xl" />
            ))
          ) : products?.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          ) : (
            products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
