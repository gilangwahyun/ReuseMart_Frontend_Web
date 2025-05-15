const ModalAlokasiDonasi = ({
  show,
  onClose,
  barangList,
  selectedBarang,
  onSelectBarang,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Pilih Barang untuk Donasi</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <select
              className="form-select"
              value={selectedBarang || ""}
              onChange={(e) => onSelectBarang(e.target.value)}
            >
              <option value="" disabled>
                -- Pilih Barang --
              </option>
              {barangList.map((barang) => (
                <option key={barang.id_barang} value={barang.id_barang}>
                  {barang.nama_barang}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={!selectedBarang}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAlokasiDonasi;