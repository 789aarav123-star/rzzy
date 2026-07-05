'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/firestore-service';
import { Product } from '@/lib/types';


const heroSlides = [
  {
    title: 'Summer Collection',
    subtitle: '2025',
    description: 'Light, breathable essentials for the season ahead.',
    cta: 'Shop Summer',
    color: 'from-zinc-900 via-zinc-800 to-zinc-900',
    emoji: '☀️',
  },
  {
    title: 'Tailored Essentials',
    subtitle: 'New Arrivals',
    description: 'Sharp silhouettes crafted from the finest materials.',
    cta: 'Explore Now',
    color: 'from-zinc-800 via-zinc-700 to-zinc-900',
    emoji: '✨',
  },
  {
    title: 'Luxury Basics',
    subtitle: 'Premium Edit',
    description: 'Redefine your everyday with our curated basics collection.',
    cta: 'Discover More',
    color: 'from-zinc-900 via-stone-800 to-zinc-900',
    emoji: '🖤',
  },
];

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over $150' },
  { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy' },
  { icon: Shield, title: 'Secure Checkout', description: 'Protected payments' },
  { icon: Sparkles, title: 'Premium Quality', description: 'Curated with care' },
];

const categories = [
  { name: 'Tops', emoji: '👕', slug: 'tops', color: 'bg-zinc-100' },
  { name: 'Bottoms', emoji: '👖', slug: 'bottoms', color: 'bg-zinc-100' },
  { name: 'Dresses', emoji: '👗', slug: 'dresses', color: 'bg-zinc-100' },
  { name: 'Outerwear', emoji: '🧥', slug: 'outerwear', color: 'bg-zinc-100' },
  { name: 'Accessories', emoji: '👜', slug: 'accessories', color: 'bg-zinc-100' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const data = await fetchProducts({ featured: true });
      setFeatured(data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load featured products:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
          </div>
        ))}

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="pt-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-medium mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    {heroSlides[currentSlide].subtitle}
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed">
                    {heroSlides[currentSlide].description}
                  </p>
                  <div className="flex items-center gap-4 mt-8">
                    <Link
                      href="/products"
                      className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-900 rounded-full
                                 font-medium hover:bg-zinc-100 transition-all active:scale-[0.98]"
                    >
                      {heroSlides[currentSlide].cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/products?featured=true"
                      className="text-white/70 hover:text-white text-sm transition-colors"
                    >
                      View Featured
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="text-[200px] leading-none"
              >
                {heroSlides[currentSlide].emoji}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'w-10 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{feature.title}</p>
                  <p className="text-xs text-zinc-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600 mb-4">
                <Star className="w-3 h-3" />
                Featured
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Curated for You
              </h2>
              <p className="text-zinc-500 mt-2">Handpicked styles from our latest collection</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-zinc-500 mt-2 max-w-md mx-auto">
              Find exactly what you&apos;re looking for
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <AnimatedSection key={cat.name} delay={i * 0.05}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`${cat.color} rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center
                             hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                >
                  <span className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </span>
                  <span className="font-medium text-zinc-900 text-sm">{cat.name}</span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <div className="aspect-[4/5] bg-zinc-100 rounded-3xl flex items-center justify-center">
                <span className="text-8xl">🏆</span>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" className="lg:pl-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600 mb-4">
                Our Story
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                Style That Speaks
                <br />
                <span className="text-zinc-400">Without Saying a Word</span>
              </h2>
              <p className="mt-6 text-zinc-500 leading-relaxed">
                At rzzy, we believe fashion is a form of self-expression. Every piece in our
                collection is thoughtfully curated to help you look and feel your best — without
                compromising on comfort, quality, or sustainability.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Premium materials sourced globally',
                  'Ethically produced & sustainably packaged',
                  'Designed for real life, not just runways',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-zinc-900 text-white rounded-full
                           text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Join the rzzy Community
            </h2>
            <p className="text-zinc-400 mt-3 max-w-lg mx-auto">
              Be the first to know about new drops, exclusive offers, and style inspiration.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 max-w-md mx-auto flex gap-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                           placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-zinc-900 rounded-xl text-sm font-medium
                           hover:bg-zinc-100 transition-all active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
