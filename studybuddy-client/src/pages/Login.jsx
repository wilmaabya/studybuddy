import { useState } from "react";
import { api, setAuthToken } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      setAuthToken(res.data.token);

      if (res.data.user.role === "tutor") {
        window.location.href = "/tutor";
      } else {
        window.location.href = "/classes";
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

 return (
  <div className="h-screen w-full bg-gray-900 flex justify-center items-center p-6">
    <div className="bg-gray-800 p-10 rounded-3xl shadow-xl w-96 border border-gray-700">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-white">
        StudyBuddy
      </h2>

      <p className="text-center text-gray-300 mb-8">
        Masuk ke akunmu dan mulai belajar 🚀
      </p>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <input
          className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          type="email"
          placeholder="Email-mu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="border border-gray-600 p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          type="password"
          placeholder="Password-mu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          className="bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 
                     transition transform hover:scale-105"
          type="submit"
        >
          Masuk
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-300">
        Belum punya akun?{" "}
        <a
          href="/register"
          className="text-blue-400 font-semibold hover:underline hover:text-blue-300"
        >
          Daftar dulu ya!
        </a>
      </p>
    </div>
  </div>
);
}
