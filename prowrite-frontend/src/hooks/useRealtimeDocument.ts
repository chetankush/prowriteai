import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Document types matching backend
type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'archived';
type DocumentType = 'cold_email' | 'hr_onboarding' | 'website_copy' | 'youtube_script' | 'software_docs' | 'other';

interface Document {
  id: string;
  workspace_id: string;
  name: string;
  type: DocumentType;
  content: string | null;
  status: DocumentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeDocumentOptions {
  /** Called when document is updated by another user */
  onRemoteUpdate?: (document: Document) => void;
  /** Called when document is deleted */
  onDelete?: () => void;
}

interface UseRealtimeDocumentReturn {
  /** Whether currently connected to realtime channel */
  isConnected: boolean;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Set saving state (for UI indicator) */
  setSaving: (saving: boolean) => void;
  /** Latest document data from realtime updates */
  realtimeDocument: Document | null;
  /** Manually unsubscribe from realtime updates */
  unsubscribe: () => void;
}

/**
 * Hook for subscribing to real-time document changes via Supabase Realtime.
 * 
 * Requirements: 7.1, 7.2, 7.3
 * - Broadcasts changes to all viewers via websocket (7.1)
 * - Subscribes to real-time updates for a document (7.2)
 * - Displays changes without page refresh (7.3)
 */
export function useRealtimeDocument(
  documentId: string | undefined,
  options: UseRealtimeDocumentOptions = {}
): UseRealtimeDocumentReturn {
  const { onRemoteUpdate, onDelete } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [realtimeDocument, setRealtimeDocument] = useState<Document | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateRef = useRef<string | null>(null);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  useEffect(() => {
    if (!documentId) {
      return;
    }

    // Create a unique channel name for this document
    const channelName = `document:${documentId}`;
    
    // Subscribe to changes on the documents table for this specific document
    const channel = supabase
      .channel(channelName)
      .on<Document>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload: RealtimePostgresChangesPayload<Document>) => {
          const newDocument = payload.new as Document;
          
          // Avoid processing our own updates by checking updated_at timestamp
          // If the update timestamp matches our last save, skip it
          if (lastUpdateRef.current && newDocument.updated_at === lastUpdateRef.current) {
            return;
          }
          
          setRealtimeDocument(newDocument);
          onRemoteUpdate?.(newDocument);
        }
      )
      .on<Document>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        () => {
          onDelete?.();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Cleanup on unmount or when documentId changes
    return () => {
      unsubscribe();
    };
  }, [documentId, onRemoteUpdate, onDelete, unsubscribe]);

  return {
    isConnected,
    isSaving,
    setSaving,
    realtimeDocument,
    unsubscribe,
  };
}

export default useRealtimeDocument;
