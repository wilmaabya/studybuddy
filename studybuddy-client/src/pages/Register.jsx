import { useState } from "react";
import { api } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password, role });
      alert("Register success");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex justify-center items-center p-6">
      <div className="bg-gray-800 p-10 rounded-3xl shadow-xl w-96 border border-gray-700">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-white">
          StudyBuddy
        </h2>

        <p className="text-center text-gray-300 mb-8">
          Daftar akun baru dan mulai belajar! 🚀
        </p>

        <form onSubmit={submit} className="flex flex-col gap-6">
          <input
            className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <input
            className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="email"
            placeholder="Email-mu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="password"
            placeholder="Password-mu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <select
            className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          <button
            className="bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700
                       transition transform hover:scale-105"
            type="submit"
          >
            Daftar
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-300">
          Sudah punya akun?{" "}
          <a
            href="/"
            className="text-blue-400 font-semibold hover:underline hover:text-blue-300"
          >
            Masuk di sini!
          </a>
        </p>
      </div>
    </div>
  );
}
