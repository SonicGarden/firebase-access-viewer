import { memo, useCallback} from 'react';
import type { ReactNode } from 'react';

export const Button = memo(({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button
      className={`p-1 bg-gray-200 border border-black border-solid rounded-md ${className || ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});
