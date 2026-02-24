import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("https://smarttechsolutions-backend.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      alert("Invalid credentials");
      return;
    }

    const data = await response.json();

    // ✅ Save token
    localStorage.setItem("token", data.token);

    // ✅ VERY IMPORTANT → save typed username directly
    localStorage.setItem("username", username);

    navigate("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    alert("Server error");
  }
};


  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h3 className="mb-4 text-center">SmartTech Login</h3>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-dark w-100">
            Login
          </button>
        </form>
      </div>

      <style>{`
        .login-wrapper {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef1f5;
        }

        .login-card {
          width: 100%;
          max-width: 350px;
          padding: 30px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

export default Login;
