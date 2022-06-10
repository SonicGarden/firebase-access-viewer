import { Button } from '@/components/Button';

export const Modal = ({
  title,
  body,
  show,
  onClickClose,
}: {
  title: string;
  body: any;
  show: boolean;
  onClickClose: () => void;
}) => {
  return show ? (
    <div className='flex flex-col fixed top-32px inset-x-32px bg-white border-1 border-black border-solid rounded-md divide-y divide-gray-300 max-h-3/4 overflow-x-hidden overflow-y-auto'>
      <div className='p-3 text-lg'>{title}</div>
      <div className='p-3'>{body}</div>
      <div className='flex flex-row-reverse p-3'>
        <Button onClick={onClickClose}>Close</Button>
      </div>
    </div>
  ) : (
    <></>
  );
};
