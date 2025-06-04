import { memo } from 'react';
import { Button } from '@/components/Button';
import type { ReactNode } from 'react';

export const Modal = memo(({
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
    <div className='flex flex-col fixed top-8 left-8 right-8 bg-white border border-black border-solid rounded-md divide-y divide-gray-300 max-h-[75vh] overflow-auto'>
      <div className='p-3 text-lg'>{title}</div>
      <div className='p-3 whitespace-pre overflow-y-auto flex-1'>{body}</div>
      <div className='flex flex-row-reverse p-3'>
        <Button onClick={onClickClose}>Close</Button>
      </div>
    </div>
  ) : null;
});
