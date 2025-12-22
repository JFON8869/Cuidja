'use client';

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { Product, Addon, AddonGroup } from '@/lib/data';

interface ProductOptionsSheetProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductOptionsSheet({ product, onAddToCart }: ProductOptionsSheetProps) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Addon[]>>({});

  const handleSingleSelectChange = (group: AddonGroup, addonName: string) => {
    const selectedAddon = group.addons.find(a => a.name === addonName);
    setSelectedOptions(prev => ({
      ...prev,
      [group.id]: selectedAddon ? [selectedAddon] : [],
    }));
  };

  const handleMultiSelectChange = (group: AddonGroup, addon: Addon, checked: boolean) => {
    setSelectedOptions(prev => {
      const currentGroupOptions = prev[group.id] || [];
      if (checked) {
        return { ...prev, [group.id]: [...currentGroupOptions, addon] };
      } else {
        return { ...prev, [group.id]: currentGroupOptions.filter(a => a.name !== addon.name) };
      }
    });
  };

  const total = useMemo(() => {
    const addonsTotal = Object.values(selectedOptions)
      .flat()
      .reduce((acc, addon) => acc + addon.price, 0);
    return product.price + addonsTotal;
  }, [product.price, selectedOptions]);
  
  const handleAddToCartClick = () => {
    const allSelectedAddons = Object.values(selectedOptions).flat();
    addToCart(product, allSelectedAddons);
    onAddToCart(product);
    setIsOpen(false);
    setSelectedOptions({});
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="w-full">
          Escolher Opções
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>
            Personalize seu pedido selecionando as opções abaixo.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-1">
          {product.addons?.map((group) => (
            <div key={group.id}>
              <h3 className="mb-3 font-semibold">{group.title}</h3>
              {group.type === 'single' ? (
                <RadioGroup 
                    onValueChange={(value) => handleSingleSelectChange(group, value)}
                    defaultValue={group.addons.find(a => a.price === 0)?.name}
                >
                  {group.addons.map((addon) => (
                    <div key={addon.name} className="flex items-center justify-between">
                      <Label htmlFor={`${group.id}-${addon.name}`} className="flex-1 font-normal cursor-pointer">
                        {addon.name}
                        {addon.price > 0 && (
                           <span className="text-sm text-muted-foreground ml-2">
                            (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})
                           </span>
                        )}
                      </Label>
                       <RadioGroupItem value={addon.name} id={`${group.id}-${addon.name}`} />
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                    {group.addons.map((addon) => (
                        <div key={addon.name} className="flex items-center justify-between">
                           <Label htmlFor={`${group.id}-${addon.name}`} className="flex-1 font-normal cursor-pointer">
                                {addon.name}
                                {addon.price > 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                    (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})
                                </span>
                                )}
                            </Label>
                             <Checkbox 
                                id={`${group.id}-${addon.name}`} 
                                onCheckedChange={(checked) => handleMultiSelectChange(group, addon, !!checked)}
                             />
                        </div>
                    ))}
                </div>
              )}
               <Separator className="mt-4" />
            </div>
          ))}
        </div>
        <SheetFooter>
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={handleAddToCartClick}>
                    Adicionar ao Carrinho
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
