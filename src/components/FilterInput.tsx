import clsx from 'clsx';

type FilterInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const FilterInput = ({ value, onChange, placeholder, className }: FilterInputProps) => {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Filter by path'}
        className='w-full px-2 py-1 pr-7 text-sm rounded border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
      />
      {value && (
        <button
          type='button'
          onClick={() => onChange('')}
          aria-label='Clear filter'
          className='absolute right-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm px-1'
        >
          ×
        </button>
      )}
    </div>
  );
};
