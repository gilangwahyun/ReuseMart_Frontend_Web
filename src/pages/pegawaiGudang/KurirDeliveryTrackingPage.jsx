import React from "react";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSidebar";
import KurirDeliveryTracking from "../../components/PegawaiGudangComponents/KurirDeliveryTracking";

const KurirDeliveryTrackingPage = () => {
  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="w-100">
        <KurirDeliveryTracking />
      </div>
    </div>
  );
};

export default KurirDeliveryTrackingPage; 