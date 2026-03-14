import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/services';
import { formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryIcons } from '@/utils/mockData';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-card card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center text-6xl">
          {categoryIcons[product.category] || '📦'}
        </div>
        {product.installmentEligible && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            Installment
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {product.rating}
          </div>
        </div>
        <h3 className="mb-2 font-display font-semibold text-card-foreground line-clamp-1">{product.name}</h3>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
          {product.installmentEligible && (
            <span className="text-xs text-muted-foreground">
              from <span className="font-semibold text-accent">{formatCurrency(product.monthlyInstallment)}</span>/mo
            </span>
          )}
        </div>
        <Link to={`/product/${product.id}`}>
          <Button variant="outline" className="w-full text-sm">View Details</Button>
        </Link>
      </div>
    </div>
  );
}
