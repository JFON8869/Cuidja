'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, MoreVertical, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

export default function MyProductsPage() {
  const myProducts = mockProducts.slice(0, 4); // Mock data for seller's products

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Meus Produtos</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 space-y-4 p-4">
        {myProducts.length > 0 ? (
          myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <Image
                  src={product.image.imageUrl}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md border object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">Estoque: 10</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum produto anunciado</h2>
            <p className="text-muted-foreground">
              Anuncie seu primeiro produto para vê-lo aqui.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
