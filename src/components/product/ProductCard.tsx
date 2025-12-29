import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Product, ImagePlaceholder } from "@/lib/data";
import { Store, Package, Wrench } from "lucide-react";
import Link from "next/link";
import { WithId } from "@/firebase/firestore/use-collection";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase";

interface ProductCardProps {
  product: WithId<Product>;
}

export function ProductCard({ product }: ProductCardProps) {
  const { firestore } = useFirebase();
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoreName() {
      if (!firestore || !product.storeId) return;
      const storeRef = doc(firestore, 'stores', product.storeId);
      try {
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
          setStoreName(storeSnap.data().name);
        }
      } catch (error) {
        console.error("Failed to fetch store name for product card:", error);
      }
    }
    fetchStoreName();
  }, [firestore, product.storeId]);
  
  const isService = product.type === 'SERVICE';

  // Ensure storeId is available before constructing the link for services
  const href = isService 
    ? (product.storeId ? `/checkout-servico?serviceId=${product.id}&storeId=${product.storeId}` : '#')
    : `/produtos/${product.id}`;

  const image: ImagePlaceholder | undefined = product.images?.[0];
  const imageUrl = image?.imageUrl;
  const imageHint = image?.imageHint || (isService ? 'professional service' : 'product photo');


  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="aspect-square relative w-full bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={imageHint}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isService ? <Wrench className="w-1/2 h-1/2 opacity-50" /> : <Package className="w-1/2 h-1/2 opacity-50" />}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-1">
          <CardTitle className="text-base font-bold leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex flex-col items-start gap-2">
           <p className="text-lg font-bold text-primary">
            {product.price > 0 ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price) : 'A combinar'}
          </p>
          {storeName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Store className="w-3 h-3"/>
              <span>{storeName}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
