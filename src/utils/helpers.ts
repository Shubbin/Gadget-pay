export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const calculateInstallment = (price: number, months: number, interestRate = 0.05): number => {
  const totalWithInterest = price * (1 + interestRate * (months / 12));
  return Math.ceil(totalWithInterest / months);
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    Active: 'bg-accent/10 text-accent',
    Completed: 'bg-primary/10 text-primary',
    Pending: 'bg-warning/10 text-warning',
    Processing: 'bg-primary/10 text-primary',
    Delivered: 'bg-accent/10 text-accent',
    Success: 'bg-accent/10 text-accent',
    Failed: 'bg-destructive/10 text-destructive',
  };
  return map[status] || 'bg-muted text-muted-foreground';
};
