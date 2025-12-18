// src/components/AdminSidebar.jsx
import React from "react";
import { FaUsers, FaChalkboardTeacher, FaChartBar, FaBars } from "react-icons/fa";
import "../assets/styles/AdminSidebar.css";

export default function AdminSidebar({ activeTab, setActiveTab, isCollapsed, onToggleCollapse }) {
  const menuItems = [
    { key: "users", icon: <FaUsers />, label: "Quản lý người dùng" },
    { key: "classes", icon: <FaChalkboardTeacher />, label: "Quản lý lớp học" },
    { key: "report", icon: <FaChartBar />, label: "Báo cáo điểm danh" },
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Nút collapse/expand */}
      <div className="toggle-btn" onClick={onToggleCollapse}>
        <FaBars />
      </div>

      {/* Logo */}
      <div className="admin-logo">
        {isCollapsed ? (
          <FaChartBar className="logo-icon" />
        ) : (
          <h2>ĐIỂM DANH KHUÔN MẶT</h2>
        )}
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`menu-item ${activeTab === item.key ? "active" : ""}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="menu-icon">{item.icon}</span>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}