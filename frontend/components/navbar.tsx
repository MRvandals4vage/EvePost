'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { name: 'Browse Events', href: '/events' },
  { name: 'About', href: '/about' },
];

const Brand = ({ className = '' }: { className?: string }) => (
  <div className={cn('flex items-center', className)}>
    <span className="text-xl font-extrabold tracking-tight text-white">
      EvePost
    </span>
  </div>
);

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled ? 'bg-neutral-950/60 backdrop-blur-md border-white/10' : 'bg-neutral-950/30 backdrop-blur-sm border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <Brand />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <GradientButton asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/auth/login">Login</Link>
              </GradientButton>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950/40 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <X className="block h-6 w-6 text-white" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 text-white" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-neutral-950/80 backdrop-blur-md" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/80 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <GradientButton asChild variant="outline" size="sm" className="w-full mt-2 border-white/30 text-white hover:bg-white/10">
              <Link href="/auth/login">Login</Link>
            </GradientButton>
          </div>
        </div>
      )}
    </nav>
  );
}
