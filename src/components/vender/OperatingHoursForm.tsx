'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DayOfWeek } from '@/lib/data';

const daysOfWeek: { id: DayOfWeek; label: string }[] = [
  { id: 'sun', label: 'Domingo' },
  { id: 'mon', label: 'Segunda-feira' },
  { id: 'tue', label: 'Terça-feira' },
  { id: 'wed', label: 'Quarta-feira' },
  { id: 'thu', label: 'Quinta-feira' },
  { id: 'fri', label: 'Sexta-feira' },
  { id: 'sat', label: 'Sábado' },
];

export function OperatingHoursForm() {
  const { control, watch } = useFormContext();

  return (
    <div className="space-y-4">
      {daysOfWeek.map((day) => {
        const isDayOpen: boolean = watch(`operatingHours.${day.id}.isOpen`);
        return (
          <div
            key={day.id}
            className="grid grid-cols-[1fr,auto,auto] items-center gap-4 rounded-md border p-4"
          >
            <FormField
              control={control}
              name={`operatingHours.${day.id}.isOpen`}
              render={({ field }) => (
                <FormItem className="col-span-3 flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{day.label}</FormLabel>
                </FormItem>
              )}
            />
            {isDayOpen && (
              <>
                <FormField
                  control={control}
                  name={`operatingHours.${day.id}.open`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Abre</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`operatingHours.${day.id}.close`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Fecha</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
