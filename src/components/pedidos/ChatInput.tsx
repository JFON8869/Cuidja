'use client';

import { useState } from 'react';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

interface ChatInputProps {
  orderId: string;
  isSeller: boolean;
}

export function ChatInput({ orderId, isSeller }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { firestore, user } = useFirebase();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !firestore) return;

    setIsSending(true);
    const messagesCol = collection(firestore, 'orders', orderId, 'messages');
    const orderRef = doc(firestore, 'orders', orderId);

    try {
      await addDoc(messagesCol, {
        senderId: user.uid,
        text: message.trim(),
        timestamp: serverTimestamp(),
      });
      
      // Update the order doc to notify the other party and set last message timestamp
      const updateData = {
          lastMessageTimestamp: serverTimestamp(),
          // If I am the seller, mark buyer's chat as unread.
          // If I am the buyer, mark seller's chat as unread.
          [isSeller ? 'buyerHasUnread' : 'sellerHasUnread']: true,
      }
      await updateDoc(orderRef, updateData);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer className="border-t bg-card p-4">
      <form onSubmit={handleSendMessage} className="relative">
        <Input
          placeholder="Digite sua mensagem..."
          className="pr-24 text-base"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={isSending}>
            <Paperclip />
          </Button>
          <Button type="submit" size="icon" disabled={!message.trim() || isSending}>
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </form>
    </footer>
  );
}
