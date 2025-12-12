import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api";

export default function TutorDashboard() {
  const [classes, setClasses] = useState([]);
  const [input, setInput] = useState({
    title: "",
    category: "",
    schedule: "",
    max_member: "",
    description: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return window.location.href = "/";
    if (role !== "tutor") return window.location.href = "/classes";

    setAuthToken(token);
    loadMyClasses();
  }, []);

  const loadMyClasses = async () => {
    const res = await api.get("/users/me/created-classes");
    setClasses(res.data.classes);
  };

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classes", input);
      alert("Berhasil bikin kelas, Semangat mentor 😎");
      loadMyClasses();
      setInput({ title: "", category: "", schedule: "", max_member: "", description: "" });
    } catch (err) {
      alert(err.response?.data?.error || "kelas gagal dibuat");
    }
  };

  const [editing, setEditing] = useState(null);

  const openEdit = (cls) => {
    setEditing(cls);
  };

  const updateClass = async () => {
    try {
      const payload = {
  title: input.title,
  description: input.description,
  category: input.category,
  schedule: new Date(input.schedule).toISOString(),
  max_member: input.max_member
};


      console.log("PAYLOAD DIKIRIM:", payload);

      await api.put(`/classes/${editing.id}`, payload);

      alert("Gagal di update");
      loadMyClasses();
      setEditing(null);
    } catch (err) {
      console.log("ERRORNYA:", err.response?.data);
      alert(err.response?.data?.error || "Datamu sudah di update");
    }
  };

  const deleteClass = async (id) => {
  if (!confirm("Yakin mau hapus kelas ini? Data akan sepenuhnya hilang")) return;

  try {
    await api.delete(`/classes/${id}`);
    alert("Kelas berhasil dihapus 💀");
    loadMyClasses();
  } catch (err) {
    alert(err.response?.data?.error || "Gagal hapus kelas");
  }
};

  const viewMembers = async (id) => {
  const res = await api.get(`/classes/${id}/members`);
  setMembers(res.data.members);
  setOpenMembers(true);
};


  const [members, setMembers] = useState([]);
  const [openMembers, setOpenMembers] = useState(false);


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold">Tutor Dashboard 🎓</h1>
        <button
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
          className="bg-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <section className="bg-gray-800 p-6 rounded-2xl mb-10 shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Buat Kelas Baru 📚</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createClass}>
          <input
            type="text"
            name="title"
            placeholder="Nama Kelas"
            value={input.title}
            onChange={handleChange}
            className="p-3 rounded-lg text-black"
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Kategori (ex: Programming)"
            value={input.category}
            onChange={handleChange}
            className="p-3 rounded-lg text-black"
          />

          <input
            type="datetime-local"
            name="schedule"
            value={input.schedule}
            onChange={handleChange}
            className="p-3 rounded-lg text-black"
          />

          <input
            type="number"
            name="max_member"
            placeholder="Maksimal Peserta"
            value={input.max_member}
            onChange={handleChange}
            className="p-3 rounded-lg text-black"
            required
          />

          <textarea
            name="description"
            placeholder="Deskripsi kelas"
            value={input.description}
            onChange={handleChange}
            className="col-span-full p-3 rounded-lg text-black"
          />

          <button className="col-span-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Create Class ✨
          </button>
        </form>
      </section>

  {editing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white text-black p-6 rounded-xl w-[450px]">
      <h2 className="text-xl font-bold mb-4">Edit Kelas ✏️</h2>

      <input
        type="text"
        value={editing.title}
        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
        placeholder="Nama Kelas"
        className="p-2 border w-full mb-2 rounded"
      />

      <input
        type="text"
        value={editing.category}
        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
        placeholder="Kategori"
        className="p-2 border w-full mb-2 rounded"
      />

      <input
        type="datetime-local"
        value={editing.schedule?.slice(0, 16)}
        onChange={(e) => setEditing({ ...editing, schedule: e.target.value })}
        className="p-2 border w-full mb-2 rounded"
      />

      <input
        type="number"
        value={editing.max_member}
        onChange={(e) => setEditing({ ...editing, max_member: e.target.value })}
        placeholder="Maksimal Peserta"
        className="p-2 border w-full mb-2 rounded"
      />

      <textarea
        value={editing.description}
        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
        placeholder="Deskripsi Kelas"
        className="p-2 border w-full mb-2 rounded"
      />

      <div className="flex gap-2 mt-4">
        <button
          onClick={updateClass}
          className="bg-blue-600 text-white p-2 rounded-lg flex-1 font-semibold"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(null)}
          className="bg-gray-400 p-2 rounded-lg flex-1 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

  {openMembers && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white text-black p-6 rounded-xl w-96">
      <h2 className="text-xl font-bold mb-4">Member Kelas</h2>

      <p>Total Peserta: {members.length}</p>

      <ul className="mt-4 max-h-40 overflow-y-auto">
        {members.map((m, i) => (
          <li key={i} className="border-b p-2">{m.name}</li>
        ))}
      </ul>

      <button
        onClick={() => setOpenMembers(false)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 w-full"
      >
        Close
      </button>
    </div>
  </div>
)}

      <section>
        <h2 className="text-2xl font-semibold mb-4">Kelas Yang Kamu Buat 📖</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 && (
            <p className="opacity-70">Belum ada kelas, buruan mulai kontribusi</p>
          )}

          {classes.map((c) => (
            <div key={c.id} className="bg-white text-gray-900 p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="mb-2 text-gray-700">{c.category}</p>
              <p className="text-sm text-gray-600">{new Date(c.schedule).toLocaleString()}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(c)}
                  className="bg-yellow-500 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => viewMembers(c.id)}
                  className="bg-green-600 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Members
                </button>

                <button
                  onClick={() => deleteClass(c.id)}
                  className="bg-red-600 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
