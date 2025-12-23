'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NewProductPage from '@/app/vender/novo-produto/page';

// This page is now a wrapper around the unified product form.
// It ensures that navigating to /editar/[id] renders the same
// form component as /novo-produto, but in "edit" mode.

export default function EditProductPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <NewProductPage />
        </Suspense>
    )
}
