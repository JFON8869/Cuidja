import Link from "next/link";
import { ArrowLeft, PlusCircle, ShoppingBag, BarChart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellPage() {
  return (
    <div className="relative bg-background max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
       <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Área do Vendedor</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-6">
        <Button size="lg" className="w-full">
            <PlusCircle className="mr-2" />
            Anunciar Novo Produto
        </Button>
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meus Produtos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Produtos ativos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+R$1.234</div>
                    <p className="text-xs text-muted-foreground">No último mês</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <BarChart className="h-5 w-5"/>
                    Desempenho
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Gráfico de desempenho em breve.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
