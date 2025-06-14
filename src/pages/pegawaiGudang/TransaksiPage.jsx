import React from "react";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSidebar";
import ListTransaksi from "../../components/PegawaiGudangComponents/ListTransaksi";

const TransaksiPage = () => {
  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="w-100">
        <ListTransaksi />
      </div>
    </div>
  );
};

export default TransaksiPage; 