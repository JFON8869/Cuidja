
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';


interface ProductOptionsSheetProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  children: React.ReactNode;
}

type SelectedOptionsState = Record<string, SelectedAddon[]>;

export function ProductOptionsSheet({ product, onAddToCart, children }: ProductOptionsSheetProps) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsState>({});

  // Reset state when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
    }
  }, [isOpen]);


  const handleSelectionChange = (group: AddonGroup, addon: Addon) => {
    setSelectedOptions(prev => {
      const newState = { ...prev };
      let groupSelections = newState[group.id] ? [...newState[group.id]] : [];
      const existingAddonIndex = groupSelections.findIndex(a => a.name === addon.name);

      if (group.type === 'single') {
        // For single selection, just set the new addon
        newState[group.id] = [{ ...addon, quantity: 1 }];
      } else { // Multiple selection
        if (existingAddonIndex > -1) {
          // If addon is already selected, remove it (uncheck)
          groupSelections.splice(existingAddonIndex, 1);
        } else {
          // If addon is not selected, add it (check)
          groupSelections.push({ ...addon, quantity: 1 });
        }
        newState[group.id] = groupSelections;
      }
      return newState;
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
    onAddToCart(product); // This just triggers the confirmation sheet
    setIsOpen(false);     // Close the options sheet
  }
  
  const isAddonChecked = (groupId: string, addonName: string): boolean => {
      const group = selectedOptions[groupId];
      if (!group) return false;
      return group.some(a => a.name === addonName);
  }
  
  const getSingleSelectedName = (groupId: string): string | undefined => {
      const group = selectedOptions[groupId];
      if (group && group.length > 0) {
        return group[0].name;
      }
      return undefined;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
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
                    onValueChange={(value) => {
                        const selectedAddon = group.addons.find(a => a.name === value);
                        if (selectedAddon) {
                            handleSelectionChange(group, selectedAddon);
                        }
                    }}
                    value={getSingleSelectedName(group.id)}
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
              ) : ( // Multiple choice
                <div className="space-y-3">
                    {group.addons.map((addon) => (
                         <div key={addon.name} className="flex items-center space-x-2">
                            <Checkbox
                                id={`${group.id}-${addon.name}`}
                                checked={isAddonChecked(group.id, addon.name)}
                                onCheckedChange={() => handleSelectionChange(group, addon)}
                            />
                            <Label 
                                htmlFor={`${group.id}-${addon.name}`}
                                className="font-normal flex-1 cursor-pointer"
                            >
                                {addon.name}
                                {addon.price > 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                    (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})
                                </span>
                                )}
                            </Label>
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
