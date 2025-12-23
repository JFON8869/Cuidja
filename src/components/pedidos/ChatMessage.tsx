'use client';

import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  senderId: string;
  text: string;
  timestamp: {
    toDate: () => Date;
  };
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useFirebase();
  const isSender = user?.uid === message.senderId;

  if (!message.timestamp) {
    // Handle cases where timestamp might be pending from server
    return (
        <div className={cn("mb-2 flex max-w-xs animate-pulse self-end")}>
            <div className="rounded-lg bg-muted px-3 py-2">
                <div className="h-4 w-24 rounded"></div>
            </div>
        </div>
    );
  }

  return (
    <div
      className={cn('mb-4 flex max-w-[80%] flex-col', isSender ? 'self-end items-end' : 'self-start items-start')}
    >
      <div
        className={cn(
          'rounded-xl px-4 py-2',
          isSender
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-card border'
        )}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {format(message.timestamp.toDate(), 'HH:mm')}
      </p>
    </div>
  );
}
