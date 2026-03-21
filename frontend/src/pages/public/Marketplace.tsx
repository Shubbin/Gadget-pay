import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services';

const brands = ['All', 'Apple', 'Samsung', 'Dell', 'Sony'];
const categories = ['All', 'Laptops', 'Phones', 'Tablets', 'Gaming', 'Audio', 'Cameras'];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll()
  });

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = brand === 'All' || p.brand === brand;
      const matchesCat = category === 'All' || p.category === category;
      return matchesSearch && matchesBrand && matchesCat;
    });
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, search, brand, category, sort]);

  return (
    <div className="py-24 lg:py-40 min-h-screen bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20 text-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Find your next gadget</p>
          <h1 className="text-5xl lg:text-7xl font-black mb-6 text-foreground tracking-tighter leading-none">Shop <span className="text-primary/40">Gadgets</span></h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-muted-foreground/60 leading-relaxed">Buy the world's best technology and pay in small, easy monthly steps.</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/40" />
            <Input 
              placeholder="Search gadgets, brands, or categories..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="h-16 pl-14 bg-white border-border rounded-2xl text-foreground placeholder:text-muted-foreground/30 focus:ring-primary/20 transition-all font-bold text-lg shadow-sm" 
            />
          </div>
          <Button variant="outline" className="h-16 gap-3 lg:hidden border-border bg-white text-foreground hover:bg-slate-50 rounded-2xl px-6 font-bold shadow-sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </Button>
          <div className={`flex flex-col gap-4 sm:flex-row ${showFilters ? '' : 'hidden lg:flex'}`}>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="h-16 w-full sm:w-44 bg-white border-border rounded-2xl text-foreground font-bold shadow-sm">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border text-foreground">
                {brands.map(b => <SelectItem key={b} value={b} className="font-bold py-3 uppercase text-[10px] tracking-widest">{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-16 w-full sm:w-48 bg-white border-border rounded-2xl text-foreground font-bold shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border text-foreground">
                {categories.map(c => <SelectItem key={c} value={c} className="font-bold py-3 uppercase text-[10px] tracking-widest">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-16 w-full sm:w-52 bg-white border-border rounded-2xl text-foreground font-bold shadow-sm">
                <SelectValue placeholder="Sort Method" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border text-foreground">
                <SelectItem value="featured" className="font-bold py-3 uppercase text-[10px] tracking-widest">Featured</SelectItem>
                <SelectItem value="price-asc" className="font-bold py-3 uppercase text-[10px] tracking-widest">Price Index ↑</SelectItem>
                <SelectItem value="price-desc" className="font-bold py-3 uppercase text-[10px] tracking-widest">Price Index ↓</SelectItem>
                <SelectItem value="rating" className="font-bold py-3 uppercase text-[10px] tracking-widest">User Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mb-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none">
          {isLoading ? 'Synchronizing catalog...' : `Active Selection: ${filtered.length} unit${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
            <p className="text-muted-foreground/60 font-bold uppercase tracking-widest text-[10px]">Loading products...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-red-500/10 bg-white py-24 text-center shadow-sm">
            <p className="text-3xl font-black text-foreground tracking-tight">Something went wrong</p>
            <p className="mt-4 text-lg font-medium text-muted-foreground/60 max-w-md mx-auto">We're having trouble loading the products right now.</p>
            <Button variant="outline" className="mt-12 h-14 px-10 rounded-xl border-border hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px]" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-border bg-white py-24 text-center shadow-sm">
            <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mb-10">
              <Search className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight lowercase">no matches found</p>
            <p className="mt-4 text-lg font-medium text-muted-foreground/60 max-w-md mx-auto italic">Refine your search parameters or adjust the filters to explore other product categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
