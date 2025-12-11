import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import UserProfile from "../components/UserProfile";
import UserProfileForm from "../components/UserProfileForm";

export default function MyProfilePage() {
  const { user, setUser } = useAuth(); 
  const [editing, setEditing] = useState(false);

  const handleSave = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditing(false);
  };

  if (!user) return <p className="text-center mt-4">Đang tải thông tin...</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Thông tin cá nhân</h2>
      {!editing ? (
        <UserProfile
          userId={user.userId} 
          onEdit={() => setEditing(true)}
        />
      ) : (
        <UserProfileForm
          userId={user.userId} 
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
