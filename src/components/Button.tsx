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
  const handleClick = () => {
    onClick?.();
  };

  return (
    <button
      className={`p-1 bg-gray-200 border border-1 border-black border-solid rounded-md ${className || ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
