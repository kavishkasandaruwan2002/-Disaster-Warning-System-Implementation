import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} — DEWECS` : 'DEWECS — Disaster Warning System';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
