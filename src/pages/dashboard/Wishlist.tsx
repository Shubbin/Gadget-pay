import { mockProducts } from '@/utils/mockData';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useApp();
  // Use some mock data if wishlist is empty for demo
  const items = wishlist.length > 0 ? wishlist : mockProducts.slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Wishlist</h1>
        <p className="text-sm text-muted-foreground">Gadgets you've saved for later</p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(p => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 bg-card/80 hover:bg-destructive/10"
                onClick={() => removeFromWishlist(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-card-foreground">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Browse our marketplace and save gadgets you love</p>
          <Link to="/marketplace"><Button className="mt-4 gradient-primary text-primary-foreground">Browse Gadgets</Button></Link>
        </div>
      )}
    </div>
  );
}
