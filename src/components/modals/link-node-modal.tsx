"use client";

import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGraphStore } from '@/store';
import type { RelationshipType } from '@/types';
import { Search, Link2 } from 'lucide-react';

interface LinkNodeModalProps {
  open: boolean;
  onClose: () => void;
  sourceNodeId?: string;
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'requires', label: 'Requires' },
  { value: 'leads_to', label: 'Leads To' },
  { value: 'used_in', label: 'Used In' },
  { value: 'explains', label: 'Explains' },
  { value: 'related_to', label: 'Related To' },
  { value: 'application_of', label: 'Application Of' },
];

export function LinkNodeModal({ open, onClose, sourceNodeId }: LinkNodeModalProps) {
  const { nodes, addEdge } = useGraphStore();
  const [search, setSearch] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('related_to');
  const [direction, setDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);

  // Filter nodes for search (exclude the source node)
  const filteredNodes = useMemo(() => {
    return nodes
      .filter((n) => n.id !== sourceNodeId)
      .filter((n) => {
        if (!search) return true;
        const query = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.topic?.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query)
        );
      });
  }, [nodes, sourceNodeId, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNodeId || !selectedTargetId) return;

    setLoading(true);
    setError('');

    try {
      const edgeBody = direction === 'outgoing'
        ? { source_node_id: sourceNodeId, target_node_id: selectedTargetId, relationship_type: relationshipType }
        : { source_node_id: selectedTargetId, target_node_id: sourceNodeId, relationship_type: relationshipType };

      const res = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edgeBody),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create connection');
      }

      const { edge } = await res.json();
      addEdge(edge);
      resetForm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearch('');
    setSelectedTargetId('');
    setRelationshipType('related_to');
    setDirection('outgoing');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" /> Link Existing Node
          </DialogTitle>
          <DialogDescription>
            Create a connection from &quot;{sourceNode?.title}&quot; to another concept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Search for nodes */}
          <div className="space-y-2">
            <Label>Search Concepts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or topic..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Node list */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredNodes.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No matching nodes found</div>
            ) : (
              filteredNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedTargetId(node.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    selectedTargetId === node.id ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{node.title}</span>
                  {node.topic && <span className="text-xs text-gray-400 ml-2">({node.topic})</span>}
                </button>
              ))
            )}
          </div>

          {/* Relationship config */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Relationship Type</Label>
              <Select
                value={relationshipType}
                onValueChange={(v) => setRelationshipType(v as RelationshipType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as 'outgoing' | 'incoming')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">{sourceNode?.title} → Target</SelectItem>
                  <SelectItem value="incoming">Target → {sourceNode?.title}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedTargetId}>
              {loading ? 'Linking...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
