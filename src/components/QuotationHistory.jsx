import { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ IMPORTANT

const QuotationHistory = ({ projectId, token }) => {
  const [quotationHistory, setQuotationHistory] = useState([]);

  /* ================= FETCH QUOTATION HISTORY ================= */
  useEffect(() => {
    const fetchQuotationHistory = async () => {
      try {
        const res = await api.get(`/quotations/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuotationHistory(res.data);

      } catch (error) {
        console.error("Error loading quotation history:", error);

        if (error.response?.status === 401) {
          alert("Unauthorized - check token");
        } else if (error.response?.status === 404) {
          alert("No quotations found");
        }
      }
    };

    if (projectId && token) {
      fetchQuotationHistory();
    }
  }, [projectId, token]);

  return (
    <div className="col-12 col-xl-4 ">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Quotation History</h5>

          {quotationHistory.length === 0 ? (
            <p className="text-muted small">No quotations yet.</p>
          ) : (
            Array.isArray(quotationHistory) &&
            quotationHistory.map((q) => (
              <div key={q.id} className="card mb-3 bg-light border-0 shadow-sm">
                <div className="card-body small">
                  <div className="text-muted mb-2">
                    {q.createdAt
                      ? new Date(q.createdAt).toLocaleString()
                      : "Not available"}
                  </div>

                  {q.items?.length > 0 && (
                    <ul className="ps-3">
                      {q.items.map((item) => (
                        <li key={item.id}>
                          {item.componentName} — Qty: {item.quantity}, ₹
                          {item.price}, Subtotal: ₹{item.subtotal}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div>Setup Charges: ₹{q.setupCharges || 0}</div>
                  <div>Development Charges: ₹{q.devCharges || 0}</div>
                  <div className="fw-bold">Grand Total: ₹{q.totalAmount}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationHistory;
