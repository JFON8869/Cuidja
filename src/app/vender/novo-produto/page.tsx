'use client';

import { ProductForm } from '@/app/vender/product-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This component now simply wraps the reusable ProductForm for the "create" case.
function NewProductPage() {
  return <ProductForm />;
}

export default function NewProductPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <NewProductPage />
    </Suspense>
  );
}
