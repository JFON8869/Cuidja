'use client';

import { ServiceForm } from '@/app/vender/service-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;

  return <ServiceForm serviceId={serviceId} />;
}

export default function EditServicePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <EditServicePage />
    </Suspense>
  );
}
