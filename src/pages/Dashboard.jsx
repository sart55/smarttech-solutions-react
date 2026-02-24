import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center px-3"
         style={{ minHeight: "80vh" }}>

      <h1 className="fw-bold mb-3 responsive-title">
        Welcome to SmartTech Solutions
      </h1>

      <p className="text-secondary mb-4 responsive-subtitle">
        Select an option from the left sidebar to continue.
      </p>

      <button
        className="btn btn-primary btn-lg px-4 responsive-btn"
        onClick={() => navigate("/all-projects")}
      >
        View All Projects
      </button>

      {/* Responsive Styling */}
      <style>{`

        .responsive-title {
          font-size: 3rem;
        }

        .responsive-subtitle {
          font-size: 1.25rem;
        }

        .responsive-btn {
          font-size: 1.1rem;
        }

        /* Tablet */
        @media (max-width: 992px) {
          .responsive-title {
            font-size: 2.2rem;
          }
          .responsive-subtitle {
            font-size: 1.1rem;
          }
        }

        /* Mobile */
        @media (max-width: 576px) {
          .responsive-title {
            font-size: 1.6rem;
          }
          .responsive-subtitle {
            font-size: 0.95rem;
          }
          .responsive-btn {
            font-size: 0.95rem;
            padding: 10px 18px;
          }
        }

      `}</style>

    </div>
  );
}

export default Dashboard;