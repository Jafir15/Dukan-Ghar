import { useListCategories, useListProducts, Product } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();
  const cartItem = items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(product);
    toast({
      title: "کارٹ میں شامل",
      description: `${product.nameUrdu} شامل ہو گیا۔`,
      duration: 2000,
    });
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col group">
      {/* Big image — no overlay */}
      <div className="w-full aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 bg-primary/10 rounded-full" />
        )}
      </div>

      {/* Info below image */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="urdu-text text-lg font-bold leading-tight text-right">{product.nameUrdu}</h3>
        <p className="text-xs text-muted-foreground text-right">{product.name}</p>
        <p className="font-bold text-primary text-sm text-right">
          Rs. {product.price}
          <span className="text-muted-foreground font-normal text-xs"> / {product.unit}</span>
        </p>

        <div className="mt-auto pt-2">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-secondary rounded-lg p-1 border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="h-8 w-8 text-secondary-foreground rounded-md hover:bg-background"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold w-8 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="h-8 w-8 text-secondary-foreground rounded-md hover:bg-background"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleAdd} className="w-full rounded-lg font-bold">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="urdu-text">کارٹ میں ڈالیں</span>
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
          <Button variant="ghost" size="icon" asChild className="rounded-full mr-2 shrink-0">
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
              <Skeleton key={i} className="w-full h-[300px] rounded-xl" />
            ))
          ) : products?.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <p className="urdu-text text-muted-foreground">اس زمرے میں کوئی مصنوعات نہیں۔</p>
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
