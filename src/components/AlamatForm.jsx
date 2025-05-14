// components/AlamatForm.js
import React, { useState, useEffect } from 'react';

const AlamatForm = ({ onSubmit, existingAlamat }) => {
    const [labelAlamat, setLabelAlamat] = useState('');
    const [alamatLengkap, setAlamatLengkap] = useState('');
    const [namaPenerima, setNamaPenerima] = useState('');
    const [noHp, setNoHp] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        if (existingAlamat) {
            setLabelAlamat(existingAlamat.label_alamat);
            setAlamatLengkap(existingAlamat.alamat_lengkap);
            setNamaPenerima(existingAlamat.nama_penerima);
            setNoHp(existingAlamat.no_hp);
            setIsDefault(existingAlamat.is_default);
        }
    }, [existingAlamat]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const alamatData = {
            label_alamat: labelAlamat,
            alamat_lengkap: alamatLengkap,
            nama_penerima: namaPenerima,
            no_hp: noHp,
            is_default: isDefault,
        };
        onSubmit(alamatData);
        // Reset form
        setLabelAlamat('');
        setAlamatLengkap('');
        setNamaPenerima('');
        setNoHp('');
        setIsDefault(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Label Alamat</label>
                <input
                    type="text"
                    className="form-control"
                    value={labelAlamat}
                    onChange={(e) => setLabelAlamat(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Alamat Lengkap</label>
                <textarea
                    className="form-control"
                    value={alamatLengkap}
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Nama Penerima</label>
                <input
                    type="text"
                    className="form-control"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">No HP</label>
                <input
                    type="text"
                    className="form-control"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3 form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label className="form-check-label">Jadikan sebagai alamat default</label>
            </div>
            <button type="submit" className="btn btn-primary">Simpan Alamat</button>
        </form>
    );
};

export default AlamatForm;