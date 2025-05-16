import React, { useEffect, useState } from "react";
import OwnerSideBar from "../../components/OwnerSideBar";
import RequestDonasiTable from "../../components/OwnerComponents/RequestDonasiTable";
import { getAllRequestDonasi } from "../../api/RequestDonasiApi";

const RequestDonasiManagement = () => {
  const [requestDonasiList, setRequestDonasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequestDonasi = async () => {
    setLoading(true);
    try {
      const response = await getAllRequestDonasi();
      console.log("Response API Request Donasi:", response); // Debug log untuk response API
      if (Array.isArray(response)) {
        setRequestDonasiList(response);
        setError(null);
      } else {
        setError("Data tidak dalam format yang benar.");
      }
    } catch (err) {
      console.error("Gagal memuat data request donasi:", err);
      setError("Gagal memuat data request donasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDonasi();
  }, []);

  return (
    <div className="d-flex">
      <OwnerSideBar />
      <div className="p-4 w-100">
        <h3>Manajerial Request Donasi</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <RequestDonasiTable
            data={requestDonasiList}
          />
        )}
      </div>
    </div>
  );
};

export default RequestDonasiManagement;