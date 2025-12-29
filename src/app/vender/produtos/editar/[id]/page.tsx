'use client';

import { ProductForm } from '@/components/vender/product-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

// This component now wraps the reusable ProductForm for the "edit" case.
function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  // Pass the productId to the form. The form itself will handle fetching the data.
  return <ProductForm productId={productId} />;
}

export default function EditProductPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <EditProductPage />
    </Suspense>
  );
}
