import { useState, useEffect } from "react";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";
import { getPembeliByUserId } from "../../api/PembeliApi";
import { getTransaksiByPembeli } from "../../api/TransaksiApi";

export default function BuyerDashboard() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_user || user?.id; // pastikan ini id_user

  console.log(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    if (!userId) return;

    // Ambil data pembeli berdasarkan id_user
    getPembeliByUserId(userId)
      .then((pembeli) => {
        setProfile(pembeli);
        if (pembeli) {
          // Fetch transactions milik pembeli ini
          getTransaksiByPembeli(pembeli.id_pembeli)
            .then((data) => setTransactions(data))
            .catch((err) => console.error("Gagal mengambil transaksi:", err));
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil data pembeli:", error);
      });
  }, [userId]);

  return (
    <div className="dashboard">
      {profile && <ProfilCard profile={profile} />}
      <ProfilHistoriTransaksi
        transactions={transactions}
        onSelect={setSelectedTx}
      />
      <ProfilDetailTransaksi
        transaction={selectedTx}
        onBack={() => setSelectedTx(null)}
      />
    </div>
  );
}