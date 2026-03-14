import { Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@gadgetflex.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: MapPin, label: 'Address', value: 'San Francisco, CA 94102' },
];

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="py-8 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-2 text-muted-foreground">Have a question? We'd love to hear from you.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {contactInfo.map(c => (
              <div key={c.label} className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Name</Label><Input placeholder="Your name" className="mt-1" required /></div>
              <div><Label>Email</Label><Input type="email" placeholder="you@example.com" className="mt-1" required /></div>
            </div>
            <div><Label>Subject</Label><Input placeholder="How can we help?" className="mt-1" required /></div>
            <div><Label>Message</Label><Textarea placeholder="Tell us more..." className="mt-1" rows={5} required /></div>
            <Button type="submit" className="gradient-primary text-primary-foreground">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
