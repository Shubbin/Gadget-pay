import { Shield, Users, Globe, Award } from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '$5M+', label: 'Gadgets Financed' },
  { value: '99%', label: 'Approval Rate' },
  { value: '4.9/5', label: 'User Rating' },
];

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'No hidden fees. What you see is what you pay.' },
  { icon: Users, title: 'Customer First', desc: 'Our support team is here 24/7 to help you.' },
  { icon: Globe, title: 'Accessibility', desc: 'Making premium tech accessible to everyone.' },
  { icon: Award, title: 'Quality Assured', desc: 'Only genuine products from authorized dealers.' },
];

export default function About() {
  return (
    <div className="py-8 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">About GadgetFlex</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're on a mission to make premium technology accessible to everyone through flexible payment solutions.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-6 text-center shadow-card">
              <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map(v => (
              <div key={v.title} className="flex gap-4 rounded-xl border bg-card p-6 shadow-card card-hover">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-card-foreground">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
