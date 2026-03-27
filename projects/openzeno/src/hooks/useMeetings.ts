import { useState, useEffect, useCallback } from 'react';

export interface Meeting {
  id: string;
  date: string;
  title: string;
  attendance: {
    ops: string;
    mkt: string;
    rev: string;
  } | null;
  duration: number | null;
  createdAt: string;
  file: string;
}

interface MeetingsResponse {
  meetings: Meeting[];
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data: MeetingsResponse = await response.json();
      setMeetings(data.meetings || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      console.error('Failed to fetch meetings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const getMeetingContent = useCallback(async (date: string): Promise<string> => {
    const response = await fetch(`/api/meetings/${date}`);
    if (!response.ok) throw new Error('Failed to fetch meeting content');
    return response.text();
  }, []);

  return {
    meetings,
    loading,
    error,
    refreshMeetings: fetchMeetings,
    getMeetingContent,
  };
}
