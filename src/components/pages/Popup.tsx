import { useState, useMemo, useCallback, memo } from 'react';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import type { Request, ModalData } from '@/hooks/useRequestsHistory';

const RequestRow = memo(({ request, onDataClick }: { request: Request; onDataClick: (data: ModalData) => void }) => {
  const handleClick = useCallback(() => {
    if (request.data) {
      onDataClick(request.data);
    }
  }, [request.data, onDataClick]);

  return (
    <tr>
      <th>{request.requestedAt}</th>
      <th>{request.method}</th>
      <th>{request.service}</th>
      <th className={`text-left overflow-auto max-w-400px ${request.data ? 'cursor-pointer' : ''}`}>
        <div onClick={handleClick}>{request.paths}</div>
      </th>
      <th>{request.status}</th>
    </tr>
  );
});

const Popup = () => {
  const [showsModal, setShowsModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData>(null);
  const { requests, reset, reload } = useRequestsHistory();
  const requestCount = useMemo(() => (requests || []).length, [requests]);
  const count = useMemo(() => (requestCount < 100 ? requestCount.toString() : ':D'), [requestCount]);
  const handleDataClick = useCallback((data: ModalData) => {
    setModalData(data);
    setShowsModal(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setShowsModal(false);
  }, []);

  return (
    <div className='container relative p-2'>
      <div className='flex mb-1'>
        <div className='flex-1 text-lg'>{`Firestore access count: ${count}`}</div>
        <div>
          <Button onClick={reload} className='mr-1'>
            Reload
          </Button>
          <Button onClick={reset}>Clear</Button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>time</th>
            <th>method</th>
            <th>service</th>
            <th className='min-w-400px'>collection or document paths</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {requests?.map((request, index) => (
            <RequestRow key={index} request={request} onDataClick={handleDataClick} />
          ))}
        </tbody>
      </table>
      {showsModal && <Modal title='Query details' body={modalData} show={showsModal} onClickClose={handleCloseModal} />}
    </div>
  );
};

export default Popup;
