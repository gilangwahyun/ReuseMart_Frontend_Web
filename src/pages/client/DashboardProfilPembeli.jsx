import { useState } from "react";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";

const dummyProfile = {
  name: "Pinsen Cetiav",
  email: "pinsen@tehcetiav.com",
  rewardPoints: 120,
};

const dummyTransactions = [
  {
    id: "TX001",
    date: "2025-04-01",
    total: 250000,
    items: [
      { name: "Teh Hijau", quantity: 2, price: 50000 },
      { name: "Teh Hitam", quantity: 3, price: 50000 },
    ],
  },
  {
    id: "TX002",
    date: "2025-04-10",
    total: 150000,
    items: [{ name: "Teh Oolong", quantity: 3, price: 50000 }],
  },
];

export default function BuyerDashboard() {
  const [selectedTx, setSelectedTx] = useState(null);

  return (
    <div className="dashboard">
      <ProfilCard profile={dummyProfile} />
      <ProfilHistoriTransaksi
        transactions={dummyTransactions}
        onSelect={setSelectedTx}
      />
      <ProfilDetailTransaksi
        transaction={selectedTx}
        onBack={() => setSelectedTx(null)}
      />
    </div>
  );
}
