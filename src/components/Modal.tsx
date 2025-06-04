import { Button } from '@/components/Button';
import type { ReactNode } from 'react';

export const Modal = ({
  title,
  body,
  show,
  onClickClose,
}: {
  title: string;
  body: ReactNode;
  show: boolean;
  onClickClose: () => void;
}) => {
  return show ? (
    <div className='flex flex-col fixed top-32px inset-x-32px bg-white border-1 border-black border-solid rounded-md divide-y divide-gray-300 max-h-3/4 overflow-auto'>
      <div className='p-3 text-lg'>{title}</div>
      <div className='p-3 whitespace-pre'>{body}</div>
      <div className='flex flex-row-reverse p-3'>
        <Button onClick={onClickClose}>Close</Button>
      </div>
    </div>
  ) : (
    <></>
  );
};
