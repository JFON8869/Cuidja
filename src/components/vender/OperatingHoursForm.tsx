
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { Clock, Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const daySchema = z.object({
  isOpen: z.boolean(),
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
});

const operatingHoursSchema = z.object({
  sun: daySchema,
  mon: daySchema,
  tue: daySchema,
  wed: daySchema,
  thu: daySchema,
  fri: daySchema,
  sat: daySchema,
});

type OperatingHoursFormValues = z.infer<typeof operatingHoursSchema>;

const daysOfWeek = [
  { key: 'sun', label: 'Domingo' },
  { key: 'mon', label: 'Segunda-feira' },
  { key: 'tue', label: 'Terça-feira' },
  { key: 'wed', label: 'Quarta-feira' },
  { key: 'thu', label: 'Quinta-feira' },
  { key: 'fri', label: 'Sexta-feira' },
  { key: 'sat', label: 'Sábado' },
] as const;

interface OperatingHoursFormProps {
  store: Store;
}

export function OperatingHoursForm({ store }: OperatingHoursFormProps) {
  const { firestore } = useFirebase();
  const form = useForm<OperatingHoursFormValues>({
    resolver: zodResolver(operatingHoursSchema),
    defaultValues: {
      sun: store.operatingHours?.sun || { isOpen: false, open: '08:00', close: '18:00' },
      mon: store.operatingHours?.mon || { isOpen: true, open: '08:00', close: '18:00' },
      tue: store.operatingHours?.tue || { isOpen: true, open: '08:00', close: '18:00' },
      wed: store.operatingHours?.wed || { isOpen: true, open: '08:00', close: '18:00' },
      thu: store.operatingHours?.thu || { isOpen: true, open: '08:00', close: '18:00' },
      fri: store.operatingHours?.fri || { isOpen: true, open: '08:00', close: '18:00' },
      sat: store.operatingHours?.sat || { isOpen: true, open: '08:00', close: '18:00' },
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: OperatingHoursFormValues) {
    if (!firestore || !store.id) {
        toast.error("Loja não encontrada.");
        return;
    }
    
    try {
      const storeRef = doc(firestore, 'stores', store.id);
      await updateDoc(storeRef, {
        operatingHours: data,
      });
      toast.success('Horário de funcionamento atualizado!');
    } catch (error) {
      console.error('Error updating operating hours: ', error);
      toast.error('Não foi possível salvar o horário.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-lg">
            <Clock className="h-5 w-5"/>
            Horário de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {daysOfWeek.map((day) => {
              const isDayOpen = form.watch(`${day.key}.isOpen`);
              return (
                <div
                  key={day.key}
                  className="grid grid-cols-3 items-center gap-4"
                >
                  <FormField
                    control={form.control}
                    name={`${day.key}.isOpen`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="flex-1 !mt-0">{day.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <FormField
                        control={form.control}
                        name={`${day.key}.open`}
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input type="time" {...field} disabled={!isDayOpen} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`${day.key}.close`}
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input type="time" {...field} disabled={!isDayOpen} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                  </div>
                </div>
              );
            })}
             <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar Horários
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
