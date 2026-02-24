import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://smarttechsolutions-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        alert("Invalid credentials");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">SmartTech Solutions</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>

      <style>{`
        /* Wrapper */
        .login-wrapper {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #a3a0da, #3b82f6);
          padding: 20px;
        }

        /* Card */
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          text-align: center;
        }

        /* Title & subtitle */
        .login-title {
          margin-bottom: 5px;
          font-size: 1.8rem;
          color: #111827;
        }

        .login-subtitle {
          margin-bottom: 25px;
          font-size: 0.95rem;
          color: #6b7280;
        }

        /* Inputs */
        .form-control {
          width: 100%;
          padding: 12px 15px;
          margin-bottom: 15px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-control:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }

        /* Button */
        .btn-login {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background: #4f46e5;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-login:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-2px);
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #ffffff;
          border-top: 3px solid #c7d2fe;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;

