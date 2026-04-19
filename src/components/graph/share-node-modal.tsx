"use client";

import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Loader2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ShareNodeModalProps {
  nodeId: string;
  nodeTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ShareNodeModal({ nodeId, nodeTitle, open, onClose }: ShareNodeModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const joinUrl = code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${code}`
    : '';

  useEffect(() => {
    if (!open || !nodeId) return;
    setCode(null);
    setLoading(true);

    fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId, label: nodeTitle }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data.code) {
          toast.error(data.error || 'Failed to generate share code.');
          onClose();
          return;
        }
        setCode(data.code);
      })
      .catch(() => {
        toast.error('Failed to generate share code.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [nodeId, nodeTitle, open, onClose]);

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Could not copy — try selecting and copying manually.');
    }
  }

  async function copyLink() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Could not copy — try selecting and copying manually.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600" />
            Share Node
          </DialogTitle>
          <DialogDescription>
            Give students this code or link to access{' '}
            <span className="font-medium text-slate-800">{nodeTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : code ? (
          <div className="space-y-5">
            {/* Big code display */}
            <div className="rounded-2xl bg-slate-950 px-6 py-6 text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400">Network Code</p>
              <button
                onClick={copyCode}
                className="group relative inline-flex items-center gap-3"
                title="Click to copy"
              >
                <span className="font-mono text-4xl font-bold tracking-[0.2em] text-white">
                  {code}
                </span>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  {copiedCode ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </span>
              </button>
              <p className="text-xs text-slate-500">Click the code to copy</p>
            </div>

            {/* How students use it */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-slate-600">Students enter this at:</p>
              <p className="text-sm font-semibold text-slate-800">
                {typeof window !== 'undefined' ? window.location.origin : ''}/join
              </p>
            </div>

            {/* Copyable direct link */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500">Or share the direct link</p>
              <div className="flex gap-2">
                <Input value={joinUrl} readOnly className="font-mono text-xs flex-1" />
                <Button size="icon" variant="outline" onClick={copyLink} title="Copy link">
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="outline" asChild title="Open link">
                  <a href={joinUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* What students will see */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 space-y-1">
              <p className="font-medium">What students see</p>
              <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                <li>Full node description and why it matters</li>
                <li>Use cases and connections</li>
                <li>Mastery test (if one exists)</li>
                <li>Link to explore in the full graph</li>
              </ul>
            </div>

            <p className="text-xs text-slate-400 text-center">
              The same code is reused each time you share this node. It never expires.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
