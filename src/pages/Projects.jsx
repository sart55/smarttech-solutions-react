import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNoQuotation, setShowNoQuotation] = useState(false);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 6;

  const [openPage, setOpenPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);
  const [noQuotationPage, setNoQuotationPage] = useState(1);

  useEffect(() => {
    setOpenPage(1);
    setClosedPage(1);
    setNoQuotationPage(1);
  }, [search, showNoQuotation, projects.length]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const projectsData = res.data;

        // Fetch quotation count for each project
        const projectsWithQuotations = await Promise.all(
          projectsData.map(async (p) => {
            const qRes = await api.get(`/quotations/project/${p.id}`);
            const quotations = qRes.data || [];
            return { ...p, quotations };
          }),
        );

        setProjects(projectsWithQuotations);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const paginate = (data, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  // 🔍 Search Filter
  const filtered = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(search.toLowerCase()),
  );

  // 🧾 Projects WITH quotation
  const projectsWithQuotation = filtered.filter(
    (p) => p.quotationCreated === true,
  );

  // 🧾 Projects WITHOUT quotation (ONLY if OPEN)
  const projectsWithoutQuotation = filtered.filter(
    (p) => !p.quotationCreated && p.status === "OPEN",
  );

  // 📂 Status separation
  const openProjects = projectsWithQuotation.filter((p) => p.status === "OPEN");

  const closedProjects = projectsWithQuotation.filter(
    (p) => p.status === "CLOSED",
  );

  const paginatedOpen = paginate(openProjects, openPage);
  const paginatedClosed = paginate(closedProjects, closedPage);
  const paginatedNoQuotation = paginate(
    projectsWithoutQuotation,
    noQuotationPage,
  );

  if (loading) {
    return (
      <div className="container mt-4 text-primary fw-semibold">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-danger fw-semibold">{error}</div>
    );
  }

return (
  <div className="container-fluid py-3 px-2 px-md-4">

    {/* ================= HEADER ================= */}
    <div className="card shadow-sm border-0 mb-4 p-3 p-md-4">
      <div className="row align-items-center g-3">

        {/* Title */}
        <div className="col-12 col-lg-3">
          <h4 className="fw-bold mb-0 text-center text-lg-start">
            All Projects
          </h4>
        </div>

        {/* Search */}
        <div className="col-12 col-lg-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Badges + Toggle */}
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-wrap justify-content-center justify-content-lg-end align-items-center gap-2">

            <span className="badge bg-primary px-3 py-2">
              Open: {openProjects.length}
            </span>

            <span className="badge bg-danger px-3 py-2">
              Closed: {closedProjects.length}
            </span>

            <span className="badge bg-warning text-dark px-3 py-2">
              No Quotation: {projectsWithoutQuotation.length}
            </span>

            <button
              className="btn btn-outline-warning btn-sm"
              onClick={() => setShowNoQuotation(!showNoQuotation)}
            >
              {showNoQuotation
                ? "Show Normal Projects"
                : "Show Projects Without Quotation"}
            </button>

          </div>
        </div>

      </div>
    </div>

    {/* ================= SHOW PROJECTS WITHOUT QUOTATION ================= */}
    {showNoQuotation ? (
      <div>
        <h5 className="border-bottom border-warning pb-2 mb-3 fw-semibold">
          Projects Without Quotation
        </h5>

        {projectsWithoutQuotation.length === 0 && (
          <p className="text-muted">No projects without quotation found</p>
        )}

        {paginatedNoQuotation.map((p) => (
          <div
            key={p.id}
            className="card mb-3 shadow-sm border-warning project-card"
            onClick={() => navigate(`/NewProject/${p.id}`)}
          >
            <div className="card-body fw-semibold small">
              {p.projectName} — {p.customerContact}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {projectsWithoutQuotation.length > ITEMS_PER_PAGE && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
            <button
              className="btn btn-outline-warning btn-sm w-100 w-md-auto"
              disabled={noQuotationPage === 1}
              onClick={() => setNoQuotationPage(noQuotationPage - 1)}
            >
              Prev
            </button>

            <span className="fw-semibold small">
              Page {noQuotationPage}
            </span>

            <button
              className="btn btn-outline-warning btn-sm w-100 w-md-auto"
              disabled={
                noQuotationPage * ITEMS_PER_PAGE >=
                projectsWithoutQuotation.length
              }
              onClick={() => setNoQuotationPage(noQuotationPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    ) : (

      /* ================= NORMAL PROJECT VIEW ================= */
      <div className="row g-4">

        {/* OPEN PROJECTS */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-3 p-md-4 h-100">
            <h5 className="border-bottom border-primary pb-2 mb-3 fw-semibold">
              Open Projects
            </h5>

            {openProjects.length === 0 && (
              <p className="text-muted small">No open projects found</p>
            )}

            {paginatedOpen.map((p) => (
              <div
                key={p.id}
                className="card mb-3 shadow-sm project-card"
                onClick={() => navigate(`/NewProject/${p.id}`)}
              >
                <div className="card-body fw-semibold small">
                  {p.projectName} — {p.customerContact}
                </div>
              </div>
            ))}

            {openProjects.length > ITEMS_PER_PAGE && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
                <button
                  className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                  disabled={openPage === 1}
                  onClick={() => setOpenPage(openPage - 1)}
                >
                  Prev
                </button>

                <span className="fw-semibold small">
                  Page {openPage}
                </span>

                <button
                  className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                  disabled={openPage * ITEMS_PER_PAGE >= openProjects.length}
                  onClick={() => setOpenPage(openPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CLOSED PROJECTS */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-3 p-md-4 h-100">
            <h5 className="border-bottom border-danger pb-2 mb-3 fw-semibold">
              Closed Projects
            </h5>

            {closedProjects.length === 0 && (
              <p className="text-muted small">No closed projects found</p>
            )}

            {paginatedClosed.map((p) => (
              <div
                key={p.id}
                className="card mb-3 shadow-sm project-card"
                onClick={() => navigate(`/closed-project/${p.id}`)}
              >
                <div className="card-body fw-semibold small">
                  {p.projectName} — {p.customerContact}
                </div>
              </div>
            ))}

            {closedProjects.length > ITEMS_PER_PAGE && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
                <button
                  className="btn btn-outline-danger btn-sm w-100 w-md-auto"
                  disabled={closedPage === 1}
                  onClick={() => setClosedPage(closedPage - 1)}
                >
                  Prev
                </button>

                <span className="fw-semibold small">
                  Page {closedPage}
                </span>

                <button
                  className="btn btn-outline-danger btn-sm w-100 w-md-auto"
                  disabled={
                    closedPage * ITEMS_PER_PAGE >= closedProjects.length
                  }
                  onClick={() => setClosedPage(closedPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    )}

    {/* Extra Styling */}
    <style>{`
      .project-card {
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        border-radius: 10px;
      }

      .project-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      }
    `}</style>

  </div>
);
};

export default Projects;
