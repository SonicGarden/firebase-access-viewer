export const Button = ({
  children,
  onClick,
  className,
}: {
  children: any;
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
