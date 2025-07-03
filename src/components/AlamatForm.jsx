import React, { useState, useEffect } from 'react';

const AlamatForm = ({ onSubmit, existingAlamat }) => {
    const [labelAlamat, setLabelAlamat] = useState('');
    const [alamatLengkap, setAlamatLengkap] = useState('');
    const [namaPenerima, setNamaPenerima] = useState('');
    const [noHp, setNoHp] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingAlamat) {
            setLabelAlamat(existingAlamat.label_alamat);
            setAlamatLengkap(existingAlamat.alamat_lengkap);
            setNamaPenerima(existingAlamat.nama_penerima);
            setNoHp(existingAlamat.no_hp);
            setIsDefault(existingAlamat.is_default);
        } else {
            // Reset form fields if existingAlamat is null or undefined
            setLabelAlamat('');
            setAlamatLengkap('');
            setNamaPenerima('');
            setNoHp('');
            setIsDefault(false);
        }
    }, [existingAlamat]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Reset error message

        // Basic validation for phone number
        if (!/^\d+$/.test(noHp)) {
            setError('No HP harus berupa angka.');
            return;
        }

        const alamatData = {
            label_alamat: labelAlamat,
            alamat_lengkap: alamatLengkap,
            nama_penerima: namaPenerima,
            no_hp: noHp,
            is_default: isDefault,
        };
        onSubmit(alamatData);

        // Reset form only if creating a new address
        if (!existingAlamat) {
            setLabelAlamat('');
            setAlamatLengkap('');
            setNamaPenerima('');
            setNoHp('');
            setIsDefault(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
                <label className="form-label" htmlFor="labelAlamat">Label Alamat</label>
                <input
                    type="text"
                    className="form-control"
                    id="labelAlamat"
                    value={labelAlamat}
                    onChange={(e) => setLabelAlamat(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label" htmlFor="alamatLengkap">Alamat Lengkap</label>
                <textarea
                    className="form-control"
                    id="alamatLengkap"
                    value={alamatLengkap}
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label" htmlFor="namaPenerima">Nama Penerima</label>
                <input
                    type="text"
                    className="form-control"
                    id="namaPenerima"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label" htmlFor="noHp">No HP</label>
                <input
                    type="text"
                    className="form-control"
                    id="noHp"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3 form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="isDefault"
                    checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)} /> 
                <label className="form-check-label" htmlFor="isDefault">Jadikan sebagai alamat default</label> 
            </div> 
            <button type="submit" className="btn btn-primary"> Simpan Alamat </button> 
        </form> 
    ); 
};

export default AlamatForm;