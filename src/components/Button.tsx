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
      className={clsx('p-1 bg-gray-200 border border-black border-solid rounded-md', className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
