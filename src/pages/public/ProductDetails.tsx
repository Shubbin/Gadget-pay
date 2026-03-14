import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts, categoryIcons } from '@/utils/mockData';
import { formatCurrency, calculateInstallment } from '@/utils/helpers';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

const plans = [
  { label: 'Daily (90 days)', months: 3, freq: 'day', divisor: 90 },
  { label: 'Weekly (6 months)', months: 6, freq: 'week', divisor: 26 },
  { label: 'Monthly (12 months)', months: 12, freq: 'month', divisor: 12 },
];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useApp();
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-4xl mb-4">📦</p>
        <h2 className="font-display text-xl font-bold text-foreground">Product not found</h2>
        <Link to="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link>
      </div>
    );
  }

  const handleAddToCart = () => { addToCart(product); toast.success('Added to cart!'); };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Link to="/marketplace" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="flex items-center justify-center rounded-xl border bg-muted/30 p-12">
            <span className="text-[120px]">{categoryIcons[product.category] || '📦'}</span>
          </div>

          {/* Info */}
          <div>
            <Badge className="mb-3 bg-accent/10 text-accent">{product.category}</Badge>
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{product.brand}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>
            <p className="mb-6 text-muted-foreground">{product.description}</p>
            <div className="mb-6 rounded-xl border bg-muted/30 p-6">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-display text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                or from <span className="font-semibold text-accent">{formatCurrency(product.monthlyInstallment)}</span>/month
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2 gradient-primary text-primary-foreground" onClick={() => toast.success('Redirecting to installment plan...')}>
                <CreditCard className="h-4 w-4" /> Start Installment Plan
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mt-10">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="plans">Installment Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="specs" className="mt-4">
            <div className="rounded-xl border bg-card">
              {Object.entries(product.specs).map(([key, val], i) => (
                <div key={key} className={`flex items-center justify-between px-6 py-4 ${i !== 0 ? 'border-t' : ''}`}>
                  <span className="text-sm font-medium text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium text-card-foreground">{val}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map(plan => {
                const installment = Math.ceil(product.price * 1.05 / plan.divisor);
                const total = installment * plan.divisor;
                return (
                  <div key={plan.label} className="rounded-xl border bg-card p-6 shadow-card card-hover">
                    <h3 className="mb-1 font-display font-semibold text-card-foreground">{plan.label}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">Pay {plan.freq === 'day' ? 'daily' : plan.freq === 'week' ? 'weekly' : 'monthly'}</p>
                    <p className="font-display text-2xl font-bold text-primary">{formatCurrency(installment)}<span className="text-sm font-normal text-muted-foreground">/{plan.freq}</span></p>
                    <p className="mt-2 text-xs text-muted-foreground">Total: {formatCurrency(total)}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-accent" /> No hidden fees</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-accent" /> Instant approval</div>
                    </div>
                    <Button className="mt-4 w-full gradient-accent text-accent-foreground" size="sm">Choose Plan</Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
