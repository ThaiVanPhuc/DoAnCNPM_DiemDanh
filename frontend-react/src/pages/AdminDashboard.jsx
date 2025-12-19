// src/pages/AdminDashboard.jsx
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import FormTable from "../components/FormTable"; // Quản lý người dùng
import ClassTable from "../components/ClassTable"; // Quản lý lớp học
import AttendanceReport from "../components/AttendanceReport"; // Báo cáo điểm danh
import ShiftTable from "../components/ShiftTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-24" : "ml-72"
        } p-10`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-full">
          {/* Tiêu đề lớn */}
          <h1 className="text-4xl font-bold text-purple-800 text-center mb-10">
            {activeTab === "users" && "QUẢN LÝ NGƯỜI DÙNG"}
            {activeTab === "classes" && "QUẢN LÝ LỚP HỌC"}
            {activeTab === "shifts" && "QUẢN LÝ CA HỌC"}
            {activeTab === "report" && "BÁO CÁO ĐIỂM DANH"}
          </h1>

          {/* Nội dung tab */}
          <div className="mt-6">
            {activeTab === "users" && <FormTable />}
            {activeTab === "classes" && <ClassTable />}
            {activeTab === "shifts" && <ShiftTable />}
            {activeTab === "report" && <AttendanceReport />}
          </div>
        </div>
      </div>
    </div>
  );
}
