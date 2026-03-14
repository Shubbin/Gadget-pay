import { Link } from 'react-router-dom';
import { Laptop } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Laptop className="h-4 w-4 text-primary-foreground" />
              </div>
              GadgetFlex
            </Link>
            <p className="text-sm text-muted-foreground">Buy the gadgets you need today and pay over time with flexible installment plans.</p>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
              <Link to="/calculator" className="hover:text-primary">Calculator</Link>
              <Link to="/about" className="hover:text-primary">About Us</Link>
              <Link to="/contact" className="hover:text-primary">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold text-foreground">Support</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/contact" className="hover:text-primary">Help Center</Link>
              <Link to="/about" className="hover:text-primary">FAQs</Link>
              <Link to="/contact" className="hover:text-primary">Terms of Service</Link>
              <Link to="/contact" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>support@gadgetflex.com</p>
              <p>+1 (555) 123-4567</p>
              <p>San Francisco, CA</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GadgetFlex. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
