import { Routes, Route } from 'react-router-dom';
import { MeetingList, MeetingDetail } from './index';
import { useMeetings } from '../../hooks/useMeetings';

export function MeetingsPage() {
  const { meetings, loading, error, getMeetingContent } = useMeetings();

  return (
    <Routes>
      <Route
        index
        element={<MeetingList meetings={meetings} loading={loading} error={error} />}
      />
      <Route
        path=":date"
        element={<MeetingDetail getMeetingContent={getMeetingContent} />}
      />
    </Routes>
  );
}
