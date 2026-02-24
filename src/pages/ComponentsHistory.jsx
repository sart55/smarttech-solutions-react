import { useState, useEffect } from "react";
import api from "../api/axios";

function ComponentsHistory() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/component-history");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const paginatedData = history.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
  <div className="history-wrapper container-fluid py-4 px-2 px-md-4">

    {/* Header */}
    <div className="history-header mb-4 text-center text-md-start">
      <h2 className="fw-bold mb-1">Components History</h2>
      <p className="subtitle mb-0">
        Track all component additions and updates
      </p>
    </div>

    {/* Loading */}
    {loading ? (
      <div className="history-loading">
        <div className="spinner"></div>
        <p className="mt-2 mb-0">Loading component history...</p>
      </div>
    ) : history.length > 0 ? (

      <div className="history-card">

        <div className="table-responsive">
          <table className="history-table table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Component</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Admin</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((h, idx) => (
                <tr key={h.id || idx}>
                  <td className="fw-semibold">{h.name}</td>
                  <td>{h.quantity}</td>
                  <td>₹{h.price}</td>
                  <td>{h.addedBy || h.admin || "Admin"}</td>
                  <td>
                    {h.date
                      ? new Date(h.date).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="history-pagination mt-3">

          <button
            className="btn btn-primary px-3"
            onClick={goPrev}
            disabled={page === 1}
          >
            ← Prev
          </button>

          <span className="fw-semibold small text-muted">
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-primary px-3"
            onClick={goNext}
            disabled={page === totalPages}
          >
            Next →
          </button>

        </div>

      </div>

    ) : (
      <div className="history-empty-card">
        <p className="mb-0">No history records found.</p>
      </div>
    )}

    {/* Professional UI CSS */}
    <style>{`

      .history-wrapper {
        max-width: 1150px;
        margin: auto;
      }

      .history-header h2 {
        color: #1e293b;
        font-size: clamp(1.4rem, 2.5vw, 1.9rem);
      }

      .subtitle {
        color: #64748b;
        font-size: 0.9rem;
      }

      .history-card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        padding: 18px;
      }

      .history-table {
        font-size: clamp(0.8rem, 1vw, 0.95rem);
      }

      .history-table th,
      .history-table td {
        padding: 12px;
        vertical-align: middle;
      }

      .history-table thead {
        background: #f8fafc;
      }

      .history-table tbody tr {
        transition: background 0.2s ease;
      }

      .history-table tbody tr:hover {
        background: #f1f5f9;
      }

      .history-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
      }

      .history-pagination .btn {
        min-width: 100px;
      }

      .history-loading {
        background: #ffffff;
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #2563eb;
        border-radius: 50%;
        margin: 0 auto 12px;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        100% { transform: rotate(360deg); }
      }

      .history-empty-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        color: #64748b;
      }

      /* Mobile Optimization */
      @media (max-width: 768px) {

        .history-pagination {
          flex-direction: column;
          align-items: stretch;
        }

        .history-pagination .btn {
          width: 100%;
        }

        .history-card {
          padding: 14px;
        }

      }

    `}</style>
  </div>
);
}

export default ComponentsHistory;