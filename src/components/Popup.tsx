import { useState } from 'react';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { Modal } from '@/components/Modal';

const Popup = () => {
  const [showsModal, setShowsModal] = useState(false);
  const [modalData, setModalData] = useState();
  const { requests } = useRequestsHistory();
  const requestCount = (requests || []).length;
  const count = requestCount < 100 ? requestCount.toString() : ':D';

  return (
    <div className='container relative p-2'>
      <div className='mb-1 w-250px text-lg'>{`Firestore access count: ${count}`}</div>
      <table>
        <thead>
          <tr>
            <th>time</th>
            <th>mothod</th>
            <th>service</th>
            <th className='min-w-400px'>collection or document IDs</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {requests &&
            requests.map(({ requestedAt, method, service, status, ids, data }, index) => {
              const handleClick = () => {
                setModalData(data);
                setShowsModal(true);
              };

              return (
                <tr key={index}>
                  <th>{requestedAt}</th>
                  <th>{method}</th>
                  <th>{service}</th>
                  <th className='text-left'>
                    <div onClick={handleClick}>{ids}</div>
                  </th>
                  <th>{status}</th>
                </tr>
              );
            })}
        </tbody>
      </table>
      {showsModal && <Modal title='Query details' body={modalData} show={showsModal} onClickClose={() => setShowsModal(false)} />}
    </div>
  );
};

export default Popup;
