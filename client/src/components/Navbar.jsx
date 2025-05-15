import React from "react";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white shadow-md h-16 flex items-center justify-between px-6 ml-64">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center space-x-4">
        {user && (
          <>
            <span className="font-medium text-gray-600 capitalize">
              Welcome, {user.role}
            </span>
            <img
              src={`https://ui-avatars.com/api/?name=${user.role}`}
              alt="avatar"
              className="h-10 w-10 rounded-full"
            />
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
