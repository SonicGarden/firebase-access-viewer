import { useRequestsHistory } from '../hooks/useRequestsHistory';

const Popup = () => {
  const { requests, error } = useRequestsHistory();
  const requestCount = (requests || []).length;
  const count = requestCount < 100 ? requestCount.toString() : ':D';

  return (
    <div className='container p-2'>
      {error ? (
        <div className='w-175px'>Please open the DevTools...orz</div>
      ) : (
        <>
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
                requests.map(({ requestedAt, method, service, status, ids }, index) => (
                  <tr key={index}>
                    <th>{requestedAt}</th>
                    <th>{method}</th>
                    <th>{service}</th>
                    <th className='text-left'>{ids}</th>
                    <th>{status}</th>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Popup;
