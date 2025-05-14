import React from 'react';

const PenitipCard = ({ penitip }) => {
    console.log("Penitip data in PenitipCard:", penitip);
    return (
        <div className="card">
        <div className="card-body">
            <h5 className="card-title"><strong>Nama Penitip: {penitip.nama_penitip}</strong></h5>
            <p className="card-text"><strong>No Telepon:</strong> {penitip.no_telepon}</p>
            <p className="card-text"><strong>Alamat:</strong> {penitip.alamat}</p>
            <p className="card-text"><strong>Saldo:</strong> {penitip.saldo}</p>
            <p className="card-text"><strong>Jumlah Poin:</strong> {penitip.jumlah_poin}</p>
        </div>
        </div>
    );
};

export default PenitipCard;