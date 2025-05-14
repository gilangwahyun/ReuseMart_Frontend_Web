import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPenitip } from '../../api/PenitipApi';
import { getHistoryByPenitipId } from '../../api/PenitipanBarangApi';
import HistoryPenitip from '../../components/HistoryPenitip';

const HistoryPenitipPage = () => {
  const { id } = useParams();
  const [penitip, setPenitip] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPenitip = async () => {
      try {
        const data = await getPenitip(id);
        setPenitip(data);
        // Fetch history data after fetching penitip data
        const historyData = await getHistoryByPenitipId(data.id_penitip);
        setHistory(historyData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchPenitip();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container py-4">
      {penitip ? (
        <>
          <HistoryPenitip penitipId={penitip.id_penitip} history={history} />
        </>
      ) : (
        <p>No penitip data available.</p>
      )}
    </div>
  );
};

export default HistoryPenitipPage;