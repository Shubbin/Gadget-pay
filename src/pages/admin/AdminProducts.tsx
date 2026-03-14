import { mockProducts } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
        <Button className="gap-2 gradient-primary text-primary-foreground" onClick={() => toast.success('Add product modal would open')}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Brand</th><th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Price</th><th className="p-4 font-medium">Rating</th><th className="p-4 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {mockProducts.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-medium text-card-foreground">{p.name}</td>
                <td className="p-4 text-muted-foreground">{p.brand}</td>
                <td className="p-4"><Badge variant="secondary">{p.category}</Badge></td>
                <td className="p-4 font-medium text-card-foreground">{formatCurrency(p.price)}</td>
                <td className="p-4 text-muted-foreground">{p.rating}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toast.success('Edit modal')}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.success('Delete confirm')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
