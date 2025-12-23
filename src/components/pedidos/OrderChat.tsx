'use client';

import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

interface OrderChatProps {
  orderId: string;
}

export function OrderChat({ orderId }: OrderChatProps) {
  const { firestore, user } = useFirebase();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const orderRef = useMemoFirebase(() => {
      if(!firestore || !orderId) return null;
      return doc(firestore, 'orders', orderId);
  }, [firestore, orderId])

  const {data: order} = useDoc(orderRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !orderId) return null;
    return query(
      collection(firestore, 'orders', orderId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, orderId]);

  const { data: messages, isLoading } = useCollection(messagesQuery);
  
  const isSeller = user?.uid === order?.sellerId;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col">
            {messages?.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
             <div ref={chatEndRef} />
          </div>
        )}
      </main>
      <ChatInput orderId={orderId} isSeller={isSeller} />
    </>
  );
}
