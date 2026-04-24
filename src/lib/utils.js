// src/lib/utils.js

import { clsx } from 'clsx';

// ── Class merging ──────────────────────────────────────────────────────────────
export function cn(...inputs) {
  return clsx(inputs);
}

// ── Date formatting ────────────────────────────────────────────────────────────
export function timeAgo(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)     return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)     return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)     return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7)    return `${day}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(date, opts = {}) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    ...opts,
  });
}

// ── Bytes formatting ──────────────────────────────────────────────────────────
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ── String utilities ───────────────────────────────────────────────────────────
export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 48);
}

// ── Source helpers ─────────────────────────────────────────────────────────────
export const SOURCE_META = {
  telegram: { label: 'Telegram', icon: '📨', color: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20'    },
  code:     { label: 'Code',     icon: '💻', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  logs:     { label: 'Log',      icon: '📋', color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20'  },
  document: { label: 'Document', icon: '📄', color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/20'},
  manual:   { label: 'Manual',   icon: '✏️', color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/20'   },
};

export function getSourceMeta(source) {
  return SOURCE_META[source] || SOURCE_META.document;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
export const STATUS_META = {
  // Deployments
  queued:     { label: 'Queued',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25' },
  building:   { label: 'Building',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25'   },
  deployed:   { label: 'Deployed',  color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/25'},
  failed:     { label: 'Failed',    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/25'    },
  cancelled:  { label: 'Cancelled', color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/25'   },
  // Errors
  open:       { label: 'Open',       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/25'    },
  fixing:     { label: 'Fixing…',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25' },
  fixed:      { label: 'Fixed',      color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25'   },
  pr_created: { label: 'PR Created', color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/25'},
  dismissed:  { label: 'Dismissed',  color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/25'   },
};

export function getStatusMeta(status) {
  return STATUS_META[status] || { label: status, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/25' };
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ── Error message extraction ───────────────────────────────────────────────────
export function getErrorMessage(err) {
  return err?.response?.data?.error
    || err?.response?.data?.message
    || err?.message
    || 'An unknown error occurred';
}

// ── Debounce ──────────────────────────────────────────────────────────────────
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}