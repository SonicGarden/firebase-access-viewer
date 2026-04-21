import { JsonView as LiteJsonView, defaultStyles, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { usePrefersDark } from '@/hooks/usePrefersDark';

const expandTopLevel = (level: number) => level < 1;

export const JsonView = ({ data }: { data: unknown }) => {
  const isDark = usePrefersDark();
  return (
    <LiteJsonView
      data={data as object}
      style={isDark ? darkStyles : defaultStyles}
      shouldExpandNode={expandTopLevel}
    />
  );
};
