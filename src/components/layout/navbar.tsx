"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  Network, LayoutDashboard, LogIn, LogOut, User, BookOpen, FileText, Sparkles, Layers
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logoutStore();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Learn', icon: LayoutDashboard },
    { href: '/graph', label: 'Map', icon: Network },
    { href: '/nexuses', label: 'My Nexuses', icon: Layers },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/generate', label: 'Generate', icon: Sparkles },
  ];

  return (
    <header className="h-14 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Knowledge Nexus</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {user && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
