import { useRequestsHistory } from '../hooks/useRequestsHistory';

const Popup = () => {
  const { requests, error } = useRequestsHistory();
  const requestCount = (requests || []).length;
  const count = requestCount < 100 ? requestCount.toString() : ':D';

  return (
    <div style={{ margin: '4px' }}>
      {error ? (
        <div style={{ width: '175px' }}>Please open the DevTools...orz</div>
      ) : (
        <>
          <div
            style={{ marginBottom: '2px', fontSize: '16px', width: '200px' }}
          >{`Firestore access count: ${count}`}</div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>mothod</th>
                <th>service</th>
                <th style={{ minWidth: '400px' }}>collection or document IDs</th>
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
                    <th style={{ textAlign: 'left' }}>{ids}</th>
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
