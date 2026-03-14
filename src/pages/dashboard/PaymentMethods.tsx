import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

const initialCards = [
  { id: '1', type: 'Visa', last4: '4242', expiry: '12/26' },
  { id: '2', type: 'Mastercard', last4: '8888', expiry: '06/25' },
];

export default function PaymentMethods() {
  const [cards, setCards] = useState(initialCards);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage your saved cards</p>
        </div>
        <Button className="gap-2 gradient-primary text-primary-foreground" onClick={() => toast.success('Add card modal would open')}>
          <Plus className="h-4 w-4" /> Add Card
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(card => (
          <div key={card.id} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">{card.type} •••• {card.last4}</p>
                <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setCards(c => c.filter(x => x.id !== card.id)); toast.success('Card removed'); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
