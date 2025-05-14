import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPenitip } from '../../api/PenitipApi'; // Ensure this API function is correctly implemented
import PenitipCard from '../../components/PenitipCard'; // Import the new PenitipCard component

const ProfilePenitip = () => {
  const { id } = useParams();
  const [penitip, setPenitip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPenitip = async () => {
    console.log("Fetching penitip with ID:", id); // Log the ID
    try {
        const data = await getPenitip(id); // Fetch penitip data by ID
        console.log("Fetched penitip data:", data); // Log the fetched data
        setPenitip(data);
    } catch (err) {
        console.error("Error fetching penitip data:", err); // Log the error
        setError(err.message || "Failed to fetch penitip data");
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
      <h2>Profile Penitip</h2>
      {penitip ? (
        <PenitipCard penitip={penitip} /> // Use the PenitipCard component
      ) : (
        <p>No penitip data available.</p>
      )}
    </div>
  );
};

export default ProfilePenitip;
