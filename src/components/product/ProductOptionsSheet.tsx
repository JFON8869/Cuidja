
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
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { Product, Addon, AddonGroup, SelectedAddon } from '@/lib/data';
import { Minus, Plus } from 'lucide-react';

interface ProductOptionsSheetProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

type SelectedOptionsState = Record<string, SelectedAddon[]>;

export function ProductOptionsSheet({ product, onAddToCart }: ProductOptionsSheetProps) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsState>({});

  const handleSingleSelectChange = (group: AddonGroup, addonName: string) => {
    const selectedAddon = group.addons.find(a => a.name === addonName);
    setSelectedOptions(prev => ({
      ...prev,
      [group.id]: selectedAddon ? [{ ...selectedAddon, quantity: 1 }] : [],
    }));
  };

  const handleQuantityChange = (group: AddonGroup, addon: Addon, change: 1 | -1) => {
    setSelectedOptions(prev => {
        const newSelectedOptions = { ...prev };
        let groupAddons = newSelectedOptions[group.id] || [];
        const existingAddonIndex = groupAddons.findIndex(a => a.name === addon.name);

        if (existingAddonIndex > -1) {
            // Addon exists, update quantity
            const newQuantity = groupAddons[existingAddonIndex].quantity + change;
            if (newQuantity > 0) {
                groupAddons[existingAddonIndex].quantity = newQuantity;
            } else {
                // Remove if quantity is 0 or less
                groupAddons.splice(existingAddonIndex, 1);
            }
        } else if (change === 1) {
            // Addon doesn't exist, add with quantity 1
            groupAddons.push({ ...addon, quantity: 1 });
        }
        
        newSelectedOptions[group.id] = groupAddons;
        return newSelectedOptions;
    });
  };

  const total = useMemo(() => {
    const addonsTotal = Object.values(selectedOptions)
      .flat()
      .reduce((acc, addon) => acc + (addon.price * addon.quantity), 0);
    return product.price + addonsTotal;
  }, [product.price, selectedOptions]);
  
  const handleAddToCartClick = () => {
    const allSelectedAddons = Object.values(selectedOptions).flat();
    addToCart(product, allSelectedAddons);
    onAddToCart(product);
    setIsOpen(false);
    setSelectedOptions({});
  }
  
  const getAddonQuantity = (groupId: string, addonName: string) => {
      return selectedOptions[groupId]?.find(a => a.name === addonName)?.quantity || 0;
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
                    defaultValue={selectedOptions[group.id]?.[0]?.name || group.addons.find(a => a.price === 0)?.name}
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
                    {group.addons.map((addon) => {
                        const quantity = getAddonQuantity(group.id, addon.name);
                        return (
                             <div key={addon.name} className="flex items-center justify-between">
                               <Label htmlFor={`${group.id}-${addon.name}`} className="flex-1 font-normal">
                                    {addon.name}
                                    {addon.price > 0 && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                        (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})
                                    </span>
                                    )}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(group, addon, -1)} disabled={quantity === 0}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-5 text-center font-bold">{quantity}</span>
                                     <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(group, addon, 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
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
