import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, CreditCard, CheckCircle, Star, Smartphone, Laptop, Tablet, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/utils/mockData';
import { motion } from 'framer-motion';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const steps = [
  { icon: Smartphone, title: 'Choose Your Gadget', desc: 'Browse our curated marketplace of premium devices from top brands.' },
  { icon: CreditCard, title: 'Select a Plan', desc: 'Pick a flexible payment plan — daily, weekly, or monthly installments.' },
  { icon: CheckCircle, title: 'Get Approved Instantly', desc: 'Quick approval process. No hidden fees, no surprises.' },
  { icon: Shield, title: 'Enjoy Your Device', desc: 'Receive your gadget and pay comfortably over time.' },
];

const benefits = [
  { icon: Clock, title: 'Flexible Schedules', desc: 'Daily, weekly, or monthly — you choose your payment rhythm.' },
  { icon: Shield, title: 'Zero Hidden Fees', desc: 'Transparent pricing with no surprise charges.' },
  { icon: CreditCard, title: 'Instant Approval', desc: 'Get approved in minutes with our streamlined process.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Freelance Designer', text: 'GadgetFlex made it possible to get my MacBook Pro without breaking the bank. The monthly payments are very manageable!', rating: 5 },
  { name: 'James K.', role: 'Student', text: 'As a student, I couldn\'t afford a new laptop upfront. GadgetFlex let me get one and pay weekly. Incredible service!', rating: 5 },
  { name: 'Amara O.', role: 'Entrepreneur', text: 'I equipped my entire team with new phones through GadgetFlex. The installment plans are unbeatable.', rating: 5 },
];

const categories = [
  { icon: Laptop, label: 'Laptops', count: 24 },
  { icon: Smartphone, label: 'Phones', count: 36 },
  { icon: Tablet, label: 'Tablets', count: 18 },
  { icon: Headphones, label: 'Accessories', count: 42 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(160, 84%, 39%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(217, 91%, 60%) 0%, transparent 50%)' }} />
        <div className="container relative mx-auto px-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              Buy the gadgets you need today and{' '}
              <span className="text-accent">pay over time</span>
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Premium devices from top brands with flexible installment plans. No hidden fees. No credit card required. Get started in minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/marketplace">
                <Button size="lg" className="gap-2 gradient-accent text-accent-foreground px-8 text-base font-semibold">
                  Browse Gadgets <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/calculator">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10">
                  Calculate Installment
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map(cat => (
              <Link key={cat.label} to={`/marketplace?category=${cat.label}`} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-card card-hover">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <cat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-card-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.count}+ products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Featured Gadgets</h2>
            <p className="mt-2 text-muted-foreground">Top picks with the best installment options</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockProducts.slice(0, 4).map((product, i) => (
              <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeIn} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="gap-2">View All Products <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">How Installment Payments Work</h2>
            <p className="mt-2 text-muted-foreground">Get your gadget in 4 simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="mb-2 flex items-center justify-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                </div>
                <h3 className="mb-2 font-display font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Why Choose GadgetFlex?</h2>
            <p className="mt-2 text-muted-foreground">Benefits that make us stand out</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border bg-card p-8 shadow-card card-hover text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <b.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">What Our Users Say</h2>
            <p className="mt-2 text-muted-foreground">Join thousands of happy customers</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-2xl gradient-hero p-12 text-center shadow-elevated lg:p-16">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground lg:text-4xl">
              Ready to get your dream gadget?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join 10,000+ users already paying flexibly for their devices.
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-accent text-accent-foreground px-10 text-base font-semibold">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
