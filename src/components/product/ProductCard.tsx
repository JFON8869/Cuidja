import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Product, type Store as StoreData } from "@/lib/data";
import { Store } from "lucide-react";
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
      const storeSnap = await getDoc(storeRef);
      if (storeSnap.exists()) {
        setStoreName(storeSnap.data().name);
      }
    }
    fetchStoreName();
  }, [firestore, product.storeId]);


  return (
    <Link href={`/produtos/${product.id}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="aspect-w-1 aspect-h-1">
            <Image
              src={product.images[0].imageUrl}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.images[0].imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-1">
          <CardTitle className="text-base font-bold leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex flex-col items-start gap-2">
           <p className="text-lg font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)}
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
