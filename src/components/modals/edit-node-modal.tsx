"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGraphStore } from '@/store';

interface EditNodeModalProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
}

export function EditNodeModal({ open, onClose, nodeId }: EditNodeModalProps) {
  const { nodes, subjects, updateNode } = useGraphStore();
  const node = nodes.find((n) => n.id === nodeId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [useCases, setUseCases] = useState('');
  const [difficulty, setDifficulty] = useState('1');

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setSubjectId(node.subject_id || '');
      setTopic(node.topic || '');
      setDescription(node.description);
      setWhyItMatters(node.why_it_matters || '');
      setUseCases((node.use_cases || []).join('\n'));
      setDifficulty(String(node.difficulty));
    }
  }, [node, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = {
        title,
        subject_id: subjectId || null,
        topic: topic || null,
        description,
        why_it_matters: whyItMatters || null,
        use_cases: useCases.split('\n').map((s) => s.trim()).filter(Boolean),
        difficulty: parseInt(difficulty),
      };

      const res = await fetch(`/api/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update node');
      }

      const { node: updatedNode } = await res.json();
      updateNode(nodeId, updatedNode);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>Update the details for &quot;{node.title}&quot;</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label htmlFor="edit-topic">Topic</Label>
            <Input id="edit-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-why">Why It Matters</Label>
            <Textarea id="edit-why" value={whyItMatters} onChange={(e) => setWhyItMatters(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-usecases">Use Cases (one per line)</Label>
            <Textarea id="edit-usecases" value={useCases} onChange={(e) => setUseCases(e.target.value)} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
