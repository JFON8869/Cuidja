'use client';

import { ServiceForm } from '@/app/vender/service-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function NewServicePage() {
  return <ServiceForm />;
}

export default function NewServicePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <NewServicePage />
    </Suspense>
  );
}
