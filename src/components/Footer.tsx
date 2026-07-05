'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Globe, MessageCircle, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-zinc-900">rzzy</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-3 leading-relaxed max-w-xs">
              Curated fashion for the modern individual. Discover styles that define you.
            </p>
            <div className="flex items-center gap-3 mt-5">{ [Camera, Globe, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-zinc-200 hover:bg-zinc-900 flex items-center justify-center
                             text-zinc-500 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-3">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Sale', 'Tops', 'Bottoms', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link
                    href="/products"
                    className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-3">
              {['Contact Us', 'FAQs', 'Shipping & Returns', 'Size Guide', 'Track Order', 'Care Instructions'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Stay in Touch</h3>
            <p className="text-sm text-zinc-500 mt-4">
              Subscribe for exclusive drops, early access, and 10% off your first order.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm
                           outline-none focus:border-zinc-900 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">
            © {currentYear} rzzy. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-zinc-400">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> by rzzy Studio
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
