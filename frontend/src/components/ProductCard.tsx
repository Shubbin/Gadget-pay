import { Link } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryIcons } from '@/utils/mockData';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-premium transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <div className="flex h-full items-center justify-center transition-transform duration-500 group-hover:scale-105 p-6">
          {product.image_url || product.image ? (
            <img 
              src={(product.image_url || product.image)!.startsWith('http') 
                ? (product.image_url || product.image)! 
                : `${import.meta.env.VITE_IMAGE_BASE_URL}${product.image_url || product.image}`} 
              alt={product.name} 
              className="h-full w-full object-contain mix-blend-multiply"
            />
          ) : (
            <span className="text-6xl drop-shadow-sm select-none">
              {categoryIcons[product.category] || '📦'}
            </span>
          )}
        </div>
        {(product.installment_eligible || product.installmentEligible) && (
          <div className="absolute left-4 top-4 rounded-full bg-primary/10 backdrop-blur-md px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-primary border border-primary/20">
            Monthly payments available
          </div>
        )}
        {product.vendor_id && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" />
            {product.rating}
          </div>
        </div>
        <h3 className="mb-3 text-lg font-black text-foreground tracking-tight line-clamp-1">{product.name}</h3>
        <div className="mb-6">
          <div className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(product.price)}</div>
          {product.installment_eligible && (
            <div className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest leading-none">
              From <span className="text-primary">{formatCurrency(product.monthly_installment || (product.price * 1.05 / 12))}</span> / month
            </div>
          )}
        </div>
        <Link to={`/product/${product.id}`}>
          <Button className="w-full h-11 rounded-xl bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[8px] border border-slate-100 shadow-none hover:shadow-lg hover:shadow-primary/20">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
