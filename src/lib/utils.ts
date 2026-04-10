import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a title string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Get the display color for a node based on its status
 */
export function getNodeStatusColor(status: string): string {
  switch (status) {
    case 'mastered':
      return '#22c55e'; // green-500
    case 'in_progress':
      return '#ef4444'; // red-500
    case 'untouched':
    default:
      return '#60a5fa'; // blue-400 (light blue)
  }
}

/**
 * Get the CSS class for node status
 */
export function getNodeStatusClass(status: string): string {
  switch (status) {
    case 'mastered':
      return 'bg-green-500 border-green-600';
    case 'in_progress':
      return 'bg-red-500 border-red-600';
    case 'untouched':
    default:
      return 'bg-blue-400 border-blue-500';
  }
}

/**
 * Get the display label for a relationship type
 */
export function getRelationshipLabel(type: string): string {
  const labels: Record<string, string> = {
    requires: 'Requires',
    used_in: 'Used In',
    explains: 'Explains',
    related_to: 'Related To',
    application_of: 'Application Of',
    leads_to: 'Leads To',
  };
  return labels[type] || type;
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(level: number): string {
  const labels = [
    '',
    'Beginner',        // 1
    'Elementary',      // 2
    'Foundational',    // 3
    'Developing',      // 4
    'Intermediate',    // 5
    'Proficient',      // 6
    'Advanced',        // 7
    'Expert',          // 8
    'Master',          // 9
    'Visionary',       // 10
  ];
  return labels[level] || 'Unknown';
}

/**
 * Format a date string
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
