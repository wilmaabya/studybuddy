import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/";
    setAuthToken(token);

    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await api.get("/classes");
    setClasses(res.data.classes);
  };

const [myClasses, setMyClasses] = useState([]);
const [showMyClasses, setShowMyClasses] = useState(false);

const loadMyClasses = async () => {
  try {
    const res = await api.get("/users/me/classes");
    setMyClasses(res.data.classes);
  } catch (err) {
    alert("Gagal load kelas yang kamu join");
  }
};


  const joinClass = async (id) => {
    try {
      await api.post(`/classes/${id}/join`);
      alert("Join sukses bos");
      loadClasses();
    } catch (err) {
      alert(err.response?.data?.error || "Join gagal");
    }
  };

  const leaveClass = async (id) => {
  try {
    await api.post(`/classes/${id}/leave`);
    alert("Asik, udah leave kelas. sampai jumpa lagi!");
    loadClasses();
  } catch (err) {
    alert(err.response?.data?.error || "Gagal leave");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold drop-shadow-lg">
          StudyBuddy Classes 🎓
        </h1>

        <button
          onClick={() => {
            setShowMyClasses(!showMyClasses);
            if (!showMyClasses) loadMyClasses();
          }}
          className="bg-green-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-green-700 transition mr-4"
        >
          My Joined Classes ⭐
        </button>

        <button
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
          className="bg-red-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <p className="text-xl mb-6 font-light">
        Welcome back, siap belajar hari ini?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 && (
          <div className="col-span-full text-center text-lg opacity-80">
            Belum ada kelas tersedia… mungkin tutornya lagi self healing.
          </div>
        )}

{showMyClasses && (
  <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-xl mb-10">
    <h2 className="text-2xl font-bold mb-4 text-green-700">
      Kelas Yang Kamu Ikuti 🌟
    </h2>

    {myClasses.length === 0 && (
      <p className="opacity-70">Kamu belum join kelas apa pun.</p>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {myClasses.map((c) => (
        <div key={c.id} className="bg-gray-100 p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-2">{c.title}</h3>
          <p className="text-sm text-gray-700">{c.category}</p>
          <p className="text-sm text-gray-600 mb-4">
            {new Date(c.schedule).toLocaleString()}
          </p>

          <button
            onClick={() => leaveClass(c.id)}
            className="bg-red-600 text-white w-full py-2 rounded-lg font-semibold hover:bg-red-700 hover:shadow-md transition"
          >
            Leave Class ❌
          </button>
        </div>
      ))}
    </div>
  </div>
)}


        {classes.map((c) => (
  <div
    key={c.id}
    className="bg-white text-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform border border-gray-200"
  >
    <h2 className="text-2xl font-bold mb-2 text-purple-700">{c.title ?? "No Title"}</h2>

    <div className="text-gray-700 text-sm space-y-1 mb-4">
      <p><span className="font-semibold">Kategori:</span> {c.category ?? "Kosong"}</p>
      <p><span className="font-semibold">Jadwal:</span> {c.schedule ?? "Belum ada"}</p>
      <p><span className="font-semibold">Kapasitas:</span> {c.max_member ?? "∞"} siswa</p>
      <p><span className="font-semibold">Tutor:</span> {c.tutor_name ?? "Tidak diketahui"}</p>
    </div>

    <button
      onClick={() => joinClass(c.id)}
      className="bg-purple-600 text-white w-full py-2 rounded-lg font-semibold hover:bg-purple-700 hover:shadow-md transition"
    >
      Join Class 🚀
    </button>

    <button
  onClick={() => leaveClass(c.id)}
  className="bg-red-600 text-white w-full mt-2 py-2 rounded-lg font-semibold hover:bg-red-700 hover:shadow-md transition"
>
  Leave Class ❌
</button>
  </div>

))}

      </div>
    </div>
  );
}
