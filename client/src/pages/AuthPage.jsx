import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "pharmacist", // default
  });

  const toggleForm = () => setIsLogin(!isLogin);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login successful!");
        window.location.href = "/";
      } else {
        await axios.post("http://localhost:5000/api/auth/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        toast.success("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-800 to-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[350px]">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login Form" : "Signup Form"}
        </h2>

        <div className="flex mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2 font-medium rounded-l-full ${
              isLogin ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2 font-medium rounded-r-full ${
              !isLogin ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="border p-2 rounded"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded font-semibold"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          {isLogin ? (
            <>
              Not a member?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={toggleForm}
              >
                Signup now
              </span>
              <br />
              {/* Forgot password link */}
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline text-left"
                onClick={() => (window.location.href = "/forgot-password")}
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={toggleForm}
              >
                Login here
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
