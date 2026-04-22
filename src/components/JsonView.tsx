import {
  JsonView as LiteJsonView,
  defaultStyles,
  darkStyles,
  allExpanded,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { usePrefersDark } from '@/hooks/usePrefersDark';

const withSyntaxColors = (base: typeof defaultStyles) => ({
  ...base,
  label: `${base.label} json-k`,
  stringValue: `${base.stringValue} json-s`,
  numberValue: `${base.numberValue} json-n`,
  booleanValue: `${base.booleanValue} json-b`,
  nullValue: `${base.nullValue} json-b`,
  undefinedValue: `${base.undefinedValue} json-b`,
  otherValue: `${base.otherValue} json-b`,
  punctuation: `${base.punctuation} json-p`,
});

const lightStyles = withSyntaxColors(defaultStyles);
const darkStylesTokens = withSyntaxColors(darkStyles);

export const JsonView = ({ data }: { data: unknown }) => {
  const isDark = usePrefersDark();
  return (
    <div className='fav-scroll font-mono text-[11.5px] leading-[1.6] bg-[var(--bg)] text-[var(--fg)] border border-[var(--line)] rounded-md px-[10px] py-2 max-h-[260px] overflow-auto'>
      <LiteJsonView
        data={data as object}
        style={isDark ? darkStylesTokens : lightStyles}
        shouldExpandNode={allExpanded}
      />
    </div>
  );
};
