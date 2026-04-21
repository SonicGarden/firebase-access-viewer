import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

export const usePrefersDark = () => {
  const [isDark, setIsDark] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setIsDark(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return isDark;
};
