import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Button = ({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      className={clsx(
        'p-1 bg-gray-200 border border-black border-solid rounded-md text-gray-900',
        'dark:bg-gray-700 dark:border-gray-500 dark:text-gray-100',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
