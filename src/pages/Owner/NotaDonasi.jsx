import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import ListNotaDonasi from "../../components/OwnerComponents/ListNotaDonasi";

const NotaDonasi = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="w-100">
        <ListNotaDonasi />
      </div>
    </div>
  );
};

export default NotaDonasi; 