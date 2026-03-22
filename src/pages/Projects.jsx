import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 6;

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [openPage, setOpenPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);
  const [noQuotationPage, setNoQuotationPage] = useState(1);

  const [activeTab, setActiveTab] = useState("open");

  // Reset pagination when data/search/tab changes
  useEffect(() => {
    setOpenPage(1);
    setClosedPage(1);
    setNoQuotationPage(1);
  }, [search, activeTab, projects.length]);

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
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

  const filtered = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  const normalizeStatus = (status) => status?.toUpperCase();

  const closedProjects = filtered.filter(
    (p) => normalizeStatus(p.status) === "CLOSED"
  );

  const openProjects = filtered.filter(
    (p) =>
      normalizeStatus(p.status) === "OPEN" && p.quotationCreated === true
  );

  const projectsWithoutQuotation = filtered.filter(
    (p) =>
      normalizeStatus(p.status) === "OPEN" && p.quotationCreated === false
  );

  const paginatedOpen = paginate(openProjects, openPage);
  const paginatedClosed = paginate(closedProjects, closedPage);
  const paginatedNoQuotation = paginate(
    projectsWithoutQuotation,
    noQuotationPage
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
    <div
      className="container-fluid px-2 px-md-4"
      style={{
        height: "100%", // ✅ use full available height
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* INNER WRAPPER */}
      <div
        style={{
          padding: "12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // ✅ prevent page scroll
        }}
      >
        {/* HEADER */}
        <div className="card shadow-sm border-0 mb-3 p-3">
          <div className="row align-items-center g-3">
            <div className="col-12 col-lg-4">
              <h4 className="fw-bold mb-0 text-center text-lg-start">
                All Projects
              </h4>
            </div>

            <div className="col-12 col-lg-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by project name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-lg-4 text-center text-lg-end">
              <span className="badge bg-primary me-2">
                Open: {openProjects.length}
              </span>
              <span className="badge bg-danger me-2">
                Closed: {closedProjects.length}
              </span>
              <span className="badge bg-warning text-dark">
                No Quotation: {projectsWithoutQuotation.length}
              </span>
            </div>
          </div>
        </div>

        {/* TABS CARD */}
        <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
          <div className="border-bottom">
            <ul className="nav nav-tabs flex-nowrap overflow-auto px-2 p-2">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "open" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("open")}
                >
                  Open Projects
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "closed" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("closed")}
                >
                  Closed Projects
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "noQuotation" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("noQuotation")}
                >
                  No Quotation
                </button>
              </li>
            </ul>
          </div>

          {/* SCROLL ONLY HERE */}
          <div
            className="card-body"
            style={{
              overflowY: "auto", // ✅ only this scrolls
              flex: 1,
            }}
          >
            {/* OPEN */}
            {activeTab === "open" && (
              <>
                {openProjects.length === 0 ? (
                  <p className="text-muted small">
                    No open projects found
                  </p>
                ) : (
                  paginatedOpen.map((p) => (
                    <div
                      key={p.id}
                      className="card mb-2 shadow-sm project-card"
                      onClick={() => navigate(`/NewProject/${p.id}`)}
                    >
                      <div className="card-body fw-semibold small">
                        {p.projectName} — {p.customerContact}
                      </div>
                    </div>
                  ))
                )}

                {openProjects.length > ITEMS_PER_PAGE && (
                  <div className="mt-3">
                    <Pagination
                      page={openPage}
                      setPage={setOpenPage}
                      total={openProjects.length}
                      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            )}

            {/* CLOSED */}
            {activeTab === "closed" && (
              <>
                {closedProjects.length === 0 ? (
                  <p className="text-muted small">
                    No closed projects found
                  </p>
                ) : (
                  paginatedClosed.map((p) => (
                    <div
                      key={p.id}
                      className="card mb-2 shadow-sm project-card"
                      onClick={() => navigate(`/closed-project/${p.id}`)}
                    >
                      <div className="card-body fw-semibold small">
                        {p.projectName} — {p.customerContact}
                      </div>
                    </div>
                  ))
                )}

                {closedProjects.length > ITEMS_PER_PAGE && (
                  <div className="mt-3">
                    <Pagination
                      page={closedPage}
                      setPage={setClosedPage}
                      total={closedProjects.length}
                      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            )}

            {/* NO QUOTATION */}
            {activeTab === "noQuotation" && (
              <>
                {projectsWithoutQuotation.length === 0 ? (
                  <p className="text-muted small">
                    No projects without quotation found
                  </p>
                ) : (
                  paginatedNoQuotation.map((p) => (
                    <div
                      key={p.id}
                      className="card mb-2 shadow-sm project-card"
                      onClick={() => navigate(`/NewProject/${p.id}`)}
                    >
                      <div className="card-body fw-semibold small">
                        {p.projectName} — {p.customerContact}
                      </div>
                    </div>
                  ))
                )}

                {projectsWithoutQuotation.length > ITEMS_PER_PAGE && (
                  <div className="mt-3">
                    <Pagination
                      page={noQuotationPage}
                      setPage={setNoQuotationPage}
                      total={projectsWithoutQuotation.length}
                      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* STYLES */}
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

        .nav-tabs .nav-link {
          white-space: nowrap;
        }

        .nav-tabs .nav-link.active {
          font-weight: 600;
          border-bottom: 3px solid #0d6efd;
        }
      `}</style>
    </div>
  );
};

/* PAGINATION */
const Pagination = ({ page, setPage, total, ITEMS_PER_PAGE }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Prev
      </button>

      <span className="small fw-semibold">Page {page}</span>

      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={page * ITEMS_PER_PAGE >= total}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Projects;
