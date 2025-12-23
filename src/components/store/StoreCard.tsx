
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isStoreOpen, slugify } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { OperatingHours } from "@/lib/data";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";


interface StoreCardProps {
  store: {
    id: string;
    name: string;
    logoUrl?: string;
    operatingHours?: OperatingHours;
  };
  categoryName: string;
  categorySlug: string;
}

export function StoreCard({ store, categoryName, categorySlug }: StoreCardProps) {
  const genericLogo = PlaceHolderImages.find(p => p.id === 'generic-store-logo');
  const isOpen = isStoreOpen(store.operatingHours);
  
  return (
    <Link href={`/lojas/${store.id}?category=${categorySlug}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="flex items-center gap-4 p-4">
          <Image
            src={store.logoUrl || genericLogo?.imageUrl || `https://picsum.photos/seed/${store.id}/80`}
            alt={`Logo da ${store.name}`}
            width={80}
            height={80}
            className="h-20 w-20 rounded-md border-2 border-card object-cover"
            data-ai-hint="store logo"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
                 <CardTitle className="text-lg font-headline">
                    {store.name}
                </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{categoryName}</p>
             <Badge className={cn("mt-2", isOpen ? "border-green-500 bg-green-100 text-green-800" : "bg-muted text-muted-foreground")}>
                {isOpen ? "Aberto" : "Fechado"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
