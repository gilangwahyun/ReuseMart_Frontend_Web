export default function ProfilCard({ profile }) {
    return (
        <div className="profile-card">
          <h2>Profil Pembeli</h2>
          <p><strong>Nama:</strong> {profile.nama_pembeli}</p>
          <p><strong>No HP:</strong> {profile.no_hp_default}</p>
          <p><strong>Poin Reward:</strong> {profile.jumlah_poin}</p>
        </div>
      );
}