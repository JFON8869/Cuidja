import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
       <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Categorias</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Selecione uma categoria na página inicial.</p>
      </main>
    </div>
  );
}
