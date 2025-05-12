export default function ProfilCard({ profile }) {
    return (
        <div className="profile-card">
          <h2>Profil Pembeli</h2>
          <p><strong>Nama:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Poin Reward:</strong> {profile.rewardPoints}</p>
        </div>
      );
}