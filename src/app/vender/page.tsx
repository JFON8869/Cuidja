'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  ShoppingBag,
  BarChart,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useProductContext } from '@/context/ProductContext';

const salesData = [
  { name: 'Jan', sales: 65 },
  { name: 'Fev', sales: 59 },
  { name: 'Mar', sales: 80 },
  { name: 'Abr', sales: 81 },
  { name: 'Mai', sales: 56 },
  { name: 'Jun', sales: 70 },
];

export default function SellPage() {
  const { products } = useProductContext();
  // This is a placeholder for the current seller's store ID.
  // In a real app, this would come from the authenticated user's data.
  const myStoreId = 'paodaterra';
  const myProductsCount = products.filter(p => p.storeId === myStoreId).length;

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Área do Vendedor</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 space-y-6 p-4">
        <Button size="lg" className="w-full" asChild>
          <Link href="/vender/novo-produto">
            <PlusCircle className="mr-2" />
            Anunciar Novo Produto
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/vender/produtos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meus Produtos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myProductsCount}</div>
                <p className="text-xs text-muted-foreground">Produtos ativos</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vender/pedidos">
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
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
              <BarChart className="h-5 w-5" />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={salesData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                 <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
