"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (normalized.length < 6) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/share/${normalized}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Code not found. Check the code and try again.');
        return;
      }
      router.push(`/join/${normalized}`);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
            <Hash className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Enter your code</h1>
          <p className="text-sm text-slate-500">
            Your teacher shared a 6-character Knowledge Nexus code with you.
          </p>
        </div>

        {/* Code entry */}
        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setError(null);
            }}
            placeholder="e.g. X7F2P4"
            maxLength={6}
            className="text-center font-mono text-2xl tracking-[0.3em] h-14 uppercase"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={normalized.length < 6 || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Open Node
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have a code?{' '}
          <a href="/graph" className="text-blue-600 hover:underline">
            Browse the graph
          </a>
        </p>
      </div>
    </div>
  );
}
