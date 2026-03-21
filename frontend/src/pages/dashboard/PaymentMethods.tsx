import { CreditCard, Plus, Trash2, Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { paymentService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function PaymentMethods() {
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => paymentService.getCards()
  });

  const removeCardMutation = useMutation({
    mutationFn: (id: string) => paymentService.removeCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Payment method removed successfully');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Billing</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Payment Methods</h1>
          <p className="mt-1 text-muted-foreground font-medium">Securely manage your saved payment options.</p>
        </div>
        <Button 
          className="h-14 px-10 rounded-xl bg-primary text-base font-bold text-white transition-all shadow-md hover:shadow-lg"
          onClick={() => toast.info('Secure card entry is coming soon')}
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Card
        </Button>
      </div>

      {cards && cards.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {cards.map((card: any, i: number) => (
              <motion.div 
                key={card.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-md group"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-colors group-hover:bg-primary/20" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 border border-border group-hover:bg-primary/5 transition-colors">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-foreground tracking-tight">{card.card_type || 'Card'} •••• {card.last4}</p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">Expires {card.exp_month}/{card.exp_year}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => removeCardMutation.mutate(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-success">Active & Primary</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
            <ShieldX className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No Payment Methods</h2>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Your saved cards will appear here once you add them.</p>
        </motion.div>
      )}
    </div>
  );
}
