import { useState, useEffect } from "react";
import api from "../api/axios"; // your axios instance
import PropTypes from "prop-types";

const PaymentForm = ({ projectId, username}) => {
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentsList, setPaymentsList] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch existing payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get(`/payments/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentsList(res.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, [projectId, token]);

  const savePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const paymentData = {
  amount: Number(amount),
  mode: paymentMode,
};

      const res = await api.post(
        `/payments/project/${projectId}`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPaymentsList([res.data, ...paymentsList]);
      setAmount("");
      setPaymentMode("Cash");
      alert("Payment saved successfully!");
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Failed to save payment");
    }
  };

  return (
    <div className="col-md-4">
  <h5>Payments</h5>

  <div className="d-flex gap-2 mb-3">
    <input
      type="number"
      className="form-control"
      placeholder="Enter amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
    />

    <select
      className="form-select"
      value={paymentMode}
      onChange={(e) => setPaymentMode(e.target.value)}
    >
      <option>Cash</option>
      <option>UPI</option>
      <option>Bank</option>
    </select>
  </div>

  <button className="btn btn-primary w-100 mb-3" onClick={savePayment}>
    Save Payment
  </button>

  <div
    className="border rounded p-2"
    style={{
      maxHeight: "250px",
      overflowY: "auto",
      backgroundColor: "#f8f9fa",
    }}
  >
    {paymentsList.length === 0 ? (
      <p className="text-muted text-center mt-3">No payments recorded yet.</p>
    ) : (
      <ul className="list-group list-group-flush">
        {paymentsList.map((p) => (
          <li
            key={p.id}
            className="list-group-item d-flex justify-content-between align-items-start flex-column"
          >
            <div className="fw-semibold">
              ₹{p.amount} — {p.mode}
            </div>
            <small className="text-muted">
              {new Date(p.createdAt).toLocaleString()} by {p.username || "You"}
            </small>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
  );
};

PaymentForm.propTypes = {
  projectId: PropTypes.number.isRequired,
 
};

export default PaymentForm;