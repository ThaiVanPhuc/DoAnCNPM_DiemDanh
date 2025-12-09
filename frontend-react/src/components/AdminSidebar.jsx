import React from "react";
import { FaUser } from "react-icons/fa";
import "../assets/styles/AdminSidebar.css";

export default function AdminSidebar({ activeTab, setActiveTab, isCollapsed }) {
  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="admin-logo">
        <span>Điểm danh bằng khuôn mặt</span>
      </div>

      <ul>
        <li
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          <FaUser /> Quản lý người dùng
        </li>
        <li
          className={activeTab === "classes" ? "active" : ""}
          onClick={() => setActiveTab("classes")}
        >
          <FaUser /> Quản lý lớp học
        </li>
      </ul>
    </div>
  );
}
