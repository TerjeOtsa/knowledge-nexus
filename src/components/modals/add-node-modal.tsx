"use client";

import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGraphStore } from '@/store';
import type { RelationshipType } from '@/types';

interface AddNodeModalProps {
  open: boolean;
  onClose: () => void;
  sourceNodeId?: string; // If provided, auto-link to this node
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'requires', label: 'Requires' },
  { value: 'leads_to', label: 'Leads To' },
  { value: 'used_in', label: 'Used In' },
  { value: 'explains', label: 'Explains' },
  { value: 'related_to', label: 'Related To' },
  { value: 'application_of', label: 'Application Of' },
];

export function AddNodeModal({ open, onClose, sourceNodeId }: AddNodeModalProps) {
  const { subjects, addNode, addEdge, nodes } = useGraphStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('leads_to');
  const [direction, setDirection] = useState<'outgoing' | 'incoming'>('outgoing');

  // Calculate position near source node
  const sourceNode = sourceNodeId ? nodes.find((n) => n.id === sourceNodeId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate position offset from source or random
      const posX = sourceNode ? sourceNode.position_x + 250 + Math.random() * 100 : Math.random() * 800;
      const posY = sourceNode ? sourceNode.position_y + Math.random() * 200 - 100 : Math.random() * 600;

      // Create the node
      const nodeRes = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject_id: subjectId || null,
          topic: topic || null,
          description,
          why_it_matters: whyItMatters || null,
          difficulty: parseInt(difficulty),
          position_x: posX,
          position_y: posY,
        }),
      });

      if (!nodeRes.ok) {
        const data = await nodeRes.json();
        throw new Error(data.error || 'Failed to create node');
      }

      const { node } = await nodeRes.json();
      addNode(node);

      // If source node exists, create the edge
      if (sourceNodeId) {
        const edgeBody = direction === 'outgoing'
          ? { source_node_id: sourceNodeId, target_node_id: node.id, relationship_type: relationshipType }
          : { source_node_id: node.id, target_node_id: sourceNodeId, relationship_type: relationshipType };

        const edgeRes = await fetch('/api/edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edgeBody),
        });

        if (edgeRes.ok) {
          const { edge } = await edgeRes.json();
          addEdge(edge);
        }
      }

      // Reset form and close
      resetForm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubjectId('');
    setTopic('');
    setDescription('');
    setWhyItMatters('');
    setDifficulty('1');
    setRelationshipType('leads_to');
    setDirection('outgoing');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Concept Node</DialogTitle>
          <DialogDescription>
            {sourceNodeId
              ? `Create a new concept and connect it to "${sourceNode?.title || 'source'}".`
              : 'Create a new concept node in the knowledge graph.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Integration"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Elementary</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Category</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Calculus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain this concept..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyItMatters">Why It Matters</Label>
            <Textarea
              id="whyItMatters"
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              placeholder="Why is this concept important?"
              rows={2}
            />
          </div>

          {/* Connection settings */}
          {sourceNodeId && (
            <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Connection to &quot;{sourceNode?.title}&quot;</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Relationship</Label>
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
                      <SelectItem value="outgoing">{sourceNode?.title} → New Node</SelectItem>
                      <SelectItem value="incoming">New Node → {sourceNode?.title}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Node'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
