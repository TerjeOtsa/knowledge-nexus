"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Search, BookOpen, Loader2, StickyNote,
  ArrowLeft, Download, ChevronDown, ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { MasterNoteEntry } from '@/types';

interface GroupedNotes {
  [subjectName: string]: {
    color: string;
    notes: MasterNoteEntry[];
  };
}

export default function MasterNotesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [notes, setNotes] = useState<MasterNoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
          // Auto-expand all subjects
          const subjects = new Set<string>();
          (data.notes || []).forEach((n: MasterNoteEntry) => {
            subjects.add(n.subject_name || 'Uncategorized');
          });
          setExpandedSubjects(subjects);
        }
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchNotes();
  }, [user]);

  // Filter notes by search
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.node_title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.subject_name?.toLowerCase().includes(q)
    );
  });

  // Group by subject
  const grouped: GroupedNotes = {};
  for (const note of filteredNotes) {
    const subjectName = note.subject_name || 'Uncategorized';
    if (!grouped[subjectName]) {
      grouped[subjectName] = {
        color: note.subject_color || '#6366f1',
        notes: [],
      };
    }
    grouped[subjectName].notes.push(note);
  }

  const toggleSubject = (name: string) => {
    const next = new Set(expandedSubjects);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedSubjects(next);
  };

  // Export all notes as text
  const handleExport = () => {
    let text = `MASTER NOTES — ${user?.name || 'User'}\n`;
    text += `Exported: ${new Date().toLocaleDateString()}\n`;
    text += '═'.repeat(60) + '\n\n';

    for (const [subjectName, group] of Object.entries(grouped)) {
      text += `\n${'─'.repeat(40)}\n`;
      text += `  ${subjectName.toUpperCase()}\n`;
      text += `${'─'.repeat(40)}\n\n`;

      for (const note of group.notes) {
        text += `▸ ${note.node_title}\n`;
        text += `  Updated: ${formatDate(note.updated_at)}\n\n`;
        text += note.content + '\n\n';
      }
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/graph')} className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Graph
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Master Notes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              All your notes, organized by subject — {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filteredNotes.length === 0}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search across all notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Notes content */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600">No Notes Yet</h3>
            <p className="text-sm text-gray-400 mt-1">
              Open any concept in the graph and use the Notes tab to start writing.
            </p>
            <Button variant="outline" onClick={() => router.push('/graph')} className="mt-4">
              <BookOpen className="w-4 h-4 mr-1.5" /> Go to Graph
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([subjectName, group]) => {
              const isExpanded = expandedSubjects.has(subjectName);
              return (
                <div key={subjectName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Subject header */}
                  <button
                    onClick={() => toggleSubject(subjectName)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-semibold text-gray-900">{subjectName}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {group.notes.length} note{group.notes.length !== 1 ? 's' : ''}
                    </Badge>
                  </button>

                  {/* Notes in this subject */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {group.notes.map((note) => (
                        <div
                          key={note.node_id}
                          className="px-5 py-4 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-800 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              {note.node_title}
                            </h3>
                            <span className="text-xs text-gray-400">
                              Updated {formatDate(note.updated_at)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed pl-6 font-mono">
                            {note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
