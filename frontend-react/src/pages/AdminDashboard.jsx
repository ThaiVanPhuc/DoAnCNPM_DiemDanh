import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import FormTable from "../components/FormTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="d-flex min-h-screen">
      <div className="flex-shrink-0">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="flex-grow-1 p-4 bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-7xl mx-auto">
          {activeTab === "users" && <FormTable />}

        </div>
      </div>
    </div>
  );
}
