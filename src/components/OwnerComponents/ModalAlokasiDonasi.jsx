const ModalAlokasiDonasi = ({
  show,
  onClose,
  barangList,
  selectedBarang,
  onSelectBarang,
  onSubmit,
  loading
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Pilih Barang untuk Donasi</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Barang yang akan didonasikan</label>
                <select
                  className="form-select"
                  value={selectedBarang || ""}
                  onChange={(e) => onSelectBarang(e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>
                    -- Pilih Barang --
                  </option>
                  {barangList && barangList.length > 0 ? (
                    barangList.map((barang) => (
                      <option key={barang.id_barang} value={barang.id_barang}>
                        {barang.nama_barang}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Tidak ada barang tersedia</option>
                  )}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Batal
              </button>
              <button
                className="btn btn-primary d-flex align-items-center"
                onClick={onSubmit}
                disabled={!selectedBarang || loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                )}
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalAlokasiDonasi;