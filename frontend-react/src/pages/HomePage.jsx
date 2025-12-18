import React, { useEffect, useState } from "react";
import Header from "../layouts/header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

export default function HomePage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPeople: 0,
    totalFaces: 0,
    totalImages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const peopleRes = await axios.get(
          `${API_BASE}/list-trained-people`
        );

        const imageRes = await axios.get(
          `${API_BASE}/list-training-images`
        );

        setStats({
          totalPeople: peopleRes.data.total_people,
          totalFaces: peopleRes.data.total_faces,
          totalImages: imageRes.data.count,
        });
      } catch (err) {
        console.error("❌ Lỗi load dữ liệu", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="container mx-auto px-4 py-10">

          {/* ================= SLIDER ================= */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl mb-12">
            <div className="absolute inset-0 bg-black/40 z-10"></div>

            <img
              src="https://onekids.edu.vn/wp-content/uploads/2025/05/diem-danh-hoc-sinh-bang-khuon-mat-onesmile-ai-1024x683.png"
              alt="face recognition"
              className="w-full h-[380px] object-cover"
            />

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-5xl font-extrabold mb-4">
                FaceCheck System
              </h1>
              <p className="text-xl max-w-2xl">
                Hệ thống điểm danh & nhận diện khuôn mặt sử dụng AI
              </p>
<h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Chào mừng bạn!
              </h1>
              
              <p className="text-xl text-blue-700 font-medium">
                Rất vui được gặp bạn hôm nay
              </p>
             
            </div>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <StatCard
              title="Người đã training"
              value={loading ? "..." : stats.totalPeople}
              icon="👥"
            />
            <StatCard
              title="Tổng khuôn mặt"
              value={loading ? "..." : stats.totalFaces}
              icon="🙂"
            />
            <StatCard
              title="Ảnh training"
              value={loading ? "..." : stats.totalImages}
              icon="📁"
            />
          </div>

          {/* ================= ACTION ================= */}
          <div className="flex justify-center gap-6 mt-12">
            <ActionButton
              label="Training khuôn mặt"
              onClick={() => navigate("/training")}
            />
            <ActionButton
              label="Điểm danh"
              onClick={() => navigate("/attendance")}
            />
          </div>

          <div className="text-center mt-16 text-gray-500 text-sm">
            © 2024 FaceCheck – AI Face Recognition
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENT ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transition">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-500">{title}</p>
      <p className="text-4xl font-extrabold text-indigo-600 mt-2">
        {value}
      </p>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition"
    >
      {label}
    </button>
  );
}
