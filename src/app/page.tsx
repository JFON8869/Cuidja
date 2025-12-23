'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingCart, Store, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/BottomNav';

const splashSteps = [
  {
    icon: Store,
    title: 'Descubra o Comércio Local',
    description: 'Encontre produtos e serviços únicos de vendedores perto de você.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzEzfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA&ixlib=rb-4.0.3&q=80&w=1080'
  },
  {
    icon: ShoppingCart,
    title: 'Compre com Facilidade e Segurança',
    description: 'Adicione itens ao carrinho e finalize sua compra com poucos cliques.',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxmcnVpdHMlMjBhbmQlMjB2ZWdldGFibGVzJTIwYmFubmVyfGVufDB8fHx8MTc3MDE3NjQ1OXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    icon: Heart,
    title: 'Apoie Pequenos Negócios',
    description: 'Cada compra ajuda a fortalecer a economia da sua comunidade.',
    image: 'https://images.unsplash.com/photo-1562340155-a721a3a5e189?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxoYW5kbWFkZSUyMGNyYWZ0c3xlbnwwfHx8fDE3NzMzMjYzNTV8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

export default function SplashPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (step < splashSteps.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/welcome');
    }
  };

  const isLastStep = step === splashSteps.length - 1;
  const currentStepData = splashSteps[step];
  const Icon = currentStepData.icon;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-card shadow-2xl">
      <div className="relative h-3/5 w-full">
        <Image
          src={currentStepData.image}
          alt={currentStepData.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
      </div>
      <div className="flex h-2/5 flex-col justify-between p-8 text-center">
        <div className="space-y-4">
            <div className="inline-flex rounded-full bg-primary/10 p-3">
                <Icon className="h-8 w-8 text-primary" />
            </div>
          <h1 className="font-headline text-3xl">{currentStepData.title}</h1>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {splashSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-full rounded-full transition-all duration-300',
                  i === step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <Button size="lg" className="w-full" onClick={handleNext}>
            {isLastStep ? 'Começar' : 'Avançar'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {!isLastStep && (
             <Button variant="ghost" className="w-full" onClick={() => router.push('/welcome')}>
                Pular
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
