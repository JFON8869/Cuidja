
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  categoryName: string;
}

export function StoreCard({ store, categoryName }: StoreCardProps) {
  const categorySlug = slugify(categoryName);

  return (
    <Link href={`/lojas/${store.id}?category=${categorySlug}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="flex items-center gap-4 p-4">
          <Image
            src={store.logoUrl || `https://picsum.photos/seed/${store.id}/80`}
            alt={`Logo da ${store.name}`}
            width={80}
            height={80}
            className="h-20 w-20 rounded-md border-2 border-card object-cover"
            data-ai-hint="store logo"
          />
          <div className="flex-1">
            <CardTitle className="text-lg font-headline">
              {store.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{categoryName}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

    