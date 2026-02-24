import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="d-flex flex-column vh-100">

      {/* ================= HEADER ================= */}
      <nav className="navbar navbar-dark bg-dark px-3 shadow-sm">
        <button
          className="btn btn-outline-light d-lg-none"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <div className="mx-auto text-center">
          <h5 className="mb-0 fw-bold text-white">
            SmartTech Solutions
          </h5>
          <small className="text-light opacity-75 d-none d-sm-block">
            We provide exactly what you want
          </small>
        </div>

        <div className="text-white fw-semibold d-none d-lg-block">
          Logged in as: <span className="text-info">{username}</span>
        </div>
      </nav>

      {/* ================= BODY ================= */}
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* ================= SIDEBAR ================= */}
        <div className={`sidebar ${sidebarOpen ? "show-sidebar" : ""}`}>

          {/* Mobile Header */}
          <div className="sidebar-header d-lg-none">
            <strong>Menu</strong>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <ul className="nav flex-column sidebar-menu">

            <li>
              <NavLink to="/dashboard" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">🏠</span>
                <span className="label">Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/all-projects" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">📂</span>
                <span className="label">All Projects</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/CustomerDetailsPage" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">➕</span>
                <span className="label">New Project</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/AdminPage" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">👤</span>
                <span className="label">Admin Page</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/temporary-quotation" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">🧾</span>
                <span className="label">Temporary Quotation</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/ComponentHistory" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <span className="icon">📜</span>
                <span className="label">Components History</span>
              </NavLink>
            </li>

            <hr />

            <li>
              <button className="btn btn-danger w-100 logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>

          </ul>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          {children}
        </main>
      </div>

      {/* ================= PROFESSIONAL STYLES ================= */}
      <style>{`

        .sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          box-shadow: 2px 0 8px rgba(0,0,0,0.04);
          transition: left 0.3s ease;
        }

        .sidebar-header {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
        }

        .sidebar-menu {
          padding: 20px 15px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #374151;
          font-weight: 500;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .nav-link .icon {
          font-size: 18px;
          width: 22px;
          text-align: center;
        }

        .nav-link .label {
          font-size: 0.95rem;
        }

        .nav-link:hover {
          background: #f3f4f6;
          color: #2563eb;
        }

        .nav-link.active {
          background: #e0edff;
          color: #2563eb !important;
          font-weight: 600;
        }

        .logout-btn {
          border-radius: 8px;
          font-weight: 500;
          padding: 8px;
        }

        /* ===== Mobile ===== */
        @media (max-width: 992px) {
          .sidebar {
            position: fixed;
            left: -270px;
            top: 0;
            height: 100%;
            z-index: 1050;
          }

          .show-sidebar {
            left: 0;
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background: rgba(0,0,0,0.4);
            z-index: 1040;
          }
        }

      `}</style>
    </div>
  );
};

export default Layout;