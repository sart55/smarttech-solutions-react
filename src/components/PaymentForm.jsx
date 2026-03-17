import { useState, useEffect } from "react";
import api from "../api/axios";
import PropTypes from "prop-types";

const PaymentForm = ({ projectId, username }) => {
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentsList, setPaymentsList] = useState([]);

  const [totalAmount, setTotalAmount] = useState(null);
  const [totalInput, setTotalInput] = useState("");

  const token = localStorage.getItem("token");

  // Fetch payments + summary
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

    const fetchSummary = async () => {
      try {
        const res = await api.get(`/payments/project/${projectId}/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTotalAmount(res.data.totalAmount);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchPayments();
    fetchSummary();
  }, [projectId, token]);

  // Save total amount
  const saveTotalAmount = async () => {
    if (!totalInput || totalInput <= 0) {
      alert("Enter valid total amount");
      return;
    }

    try {
      const res = await api.post(
        `/payments/project/${projectId}/total`,
        { totalAmount: Number(totalInput) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTotalAmount(res.data.totalAmount);
      setTotalInput("");
      alert("Total amount saved!");
    } catch (error) {
      console.error("Error saving total amount:", error);
      alert("Failed to save total amount");
    }
  };

  // Save payment
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

  // Calculate totals
  const totalPaid = paymentsList.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount ? totalAmount - totalPaid : 0;

  const isTotalSet = totalAmount && totalAmount > 0;

  return (
     <div className="card p-4 mb-4 shadow-sm">
      <h5>Payments</h5>

      {/* TOTAL AMOUNT INPUT */}
      {!isTotalSet && (
        <div className="card p-3 mb-3">
          <h6 className="mb-2">Set Total Project Amount</h6>

          <div className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              placeholder="Enter total amount"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
            />

            <button className="btn btn-success" onClick={saveTotalAmount}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* TOTAL + REMAINING */}
      {isTotalSet && (
        <div className="card p-3 mb-3 bg-light">
          <div className="fw-semibold">
            Total Amount: ₹{totalAmount}
          </div>

          <div className="text-success">
            Remaining Amount: ₹{remainingAmount}
          </div>
        </div>
      )}

      {/* PAYMENT INPUT */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isTotalSet}
        />

        <select
          className="form-select"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          disabled={!isTotalSet}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Bank</option>
        </select>
      </div>

      <button
        className="btn btn-primary w-100 mb-3"
        onClick={savePayment}
        disabled={!isTotalSet}
      >
        Save Payment
      </button>

      {/* PAYMENT HISTORY */}
      <div
        className="border rounded p-2"
        style={{
          maxHeight: "130px",
          overflowY: "auto",
          backgroundColor: "#f8f9fa",
        }}
      >
        {paymentsList.length === 0 ? (
          <p className="text-muted text-center mt-3">
            No payments recorded yet.
          </p>
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
                  {new Date(p.createdAt).toLocaleString()} by{" "}
                  {p.username || "You"}
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
