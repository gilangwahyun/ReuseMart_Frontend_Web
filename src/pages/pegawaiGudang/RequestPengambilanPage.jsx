import React from "react";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSidebar";
import RequestPengambilanList from "../../components/PegawaiGudangComponents/RequestPengambilanList";

const RequestPengambilanPage = () => {
  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="w-100">
        <RequestPengambilanList />
      </div>
    </div>
  );
};

export default RequestPengambilanPage; 