import React from 'react';

const PembeliCard = ({ pembeli }) => {
    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title"><strong>Nama Pembeli: {pembeli.nama_pembeli}</strong></h5>
                <p className="card-text"><strong>No Telepon:</strong> {pembeli.no_hp_default}</p>
                <p className="card-text"><strong>Jumlah Poin:</strong> {pembeli.jumlah_poin}</p>
            </div>
        </div>
    );
};

export default PembeliCard;