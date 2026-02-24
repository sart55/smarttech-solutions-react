import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ClosedProjectDetails = () => {
  const { projectId } = useParams();
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [comments, setComments] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [activeTab, setActiveTab] = useState("quotations");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const [p, pay, com, quo] = await Promise.all([
      api.get(`/projects/${projectId}`, { headers }),
      api.get(`/payments/project/${projectId}`, { headers }),
      api.get(`/comments/project/${projectId}`, { headers }),
      api.get(`/quotations/project/${projectId}`, { headers }),
    ]);

    setProject(p.data);
    setPayments(pay.data);
    setComments(com.data);
    setQuotations(quo.data);
  };

  // ================= DELETE FUNCTIONS =================

  const deleteItem = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    await api.delete(`/${type}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchAll();
  };

  // ------------
  // ================= DELETE ALL FUNCTION (FIXED) =================

  const deleteAll = async (type) => {
    if (!window.confirm("Are you sure you want to delete all records?")) return;
    console.log("TOKEN USED:", token);
    console.log("Sending header:", `Bearer ${token}`);
    try {
      await api.delete(`/${type}/project/${projectId}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Deleted successfully!");
      fetchAll();
    } catch (error) {
      console.error("Delete error:", error.response || error);
      alert("Unauthorized or Delete Failed");
    }
  };

  // ================= DOWNLOAD INVOICE =================

  const downloadInvoice = () => {
    if (!quotations.length) {
      alert("No quotations available.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primary = [30, 58, 95];
    const accent = [52, 152, 219];
    const light = [245, 247, 250];

    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toLocaleString();

    // ===== HEADER =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...primary);
    doc.text("SmartTech Solutions", 20, 20);

    doc.setFontSize(11);
    doc.setFont("times", "italic");
    doc.setTextColor(120);
    doc.text("We provide exactly what you want.", 20, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("FINAL INVOICE", 140, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${invoiceNumber}`, 140, 27);
    doc.text(`Date: ${invoiceDate}`, 140, 33);

    doc.setDrawColor(...accent);
    doc.setLineWidth(1);
    doc.line(20, 38, pageWidth - 20, 38);

    // ===== CUSTOMER DETAILS =====
    let y = 50;

    doc.setFillColor(...light);
    doc.roundedRect(15, y - 10, pageWidth - 30, 50, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...accent);
    doc.text("Customer Details", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);

    y += 10;
    doc.text(`Project Name: ${project.projectName}`, 20, y);
    doc.text(`Customer Name: ${project.customerName}`, 110, y);
    y += 8;
    doc.text(`Contact: ${project.customerContact}`, 20, y);
    doc.text(`Email: ${project.customerEmail}`, 110, y);
    y += 8;
    doc.text(`College: ${project.customerCollege}`, 20, y);
    doc.text(`Branch: ${project.customerBranch}`, 110, y);

    // ===== COMPONENT COLLECTION =====
    let components = {};
    let totalSetup = 0;
    let totalDev = 0;
    let grandTotal = 0;

    quotations.forEach((q) => {
      (q.items || []).forEach((item) => {
        const name = item.name || item.componentName || "Component";
        if (!components[name]) {
          components[name] = { qty: 0, price: item.price };
        }
        components[name].qty += item.quantity;
        grandTotal += item.price * item.quantity;
      });

      totalSetup += Number(q.setupCharges || 0);
      totalDev += Number(q.devCharges || 0);
    });

    grandTotal += totalSetup + totalDev;

    // ===== TABLE =====
    y += 20;

    autoTable(doc, {
      startY: y,
      head: [["Component", "Qty", "Unit Price", "Total"]],
      body: Object.keys(components).map((key) => [
        key,
        components[key].qty,
        `Rs ${components[key].price}`,
        `Rs ${components[key].price * components[key].qty}`,
      ]),
      theme: "grid",
      styles: { fontSize: 11 },
      headStyles: {
        fillColor: primary,
        textColor: 255,
      },
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // ===================== SUMMARY ALIGN FIX =====================

    const boxWidth = 80;
    const boxX = pageWidth - boxWidth - 20;

    doc.setFillColor(235, 235, 235);
    doc.roundedRect(boxX, finalY - 10, boxWidth, 30, 4, 4, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.text(`Setup Charges: Rs ${totalSetup}`, boxX + 5, finalY);
    doc.text(`Development Charges: Rs ${totalDev}`, boxX + 5, finalY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Grand Total: Rs ${grandTotal}`, boxX + 5, finalY + 18);

    // ===================== FOOTER ALIGN FIX =====================

    const footerY = doc.internal.pageSize.getHeight() - 25;

    doc.setDrawColor(...accent);
    doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Thank you for trusting SmartTech Solutions.",
      pageWidth / 2,
      footerY,
      { align: "center" },
    );

    doc.setFont("helvetica", "bold");
    doc.text(
      "Contact: 8805205049 | 8055335650 | 8446052814",
      pageWidth / 2,
      footerY + 8,
      { align: "center" },
    );

    doc.save(`${project.projectName}-${project.customerContact}-Invoice.pdf`);
  };
  if (!project) return <div className="text-center mt-5">Loading...</div>;

return (
  <div className="container-fluid py-3 px-2 px-md-4">

    {/* ================= HEADER ================= */}
    <div className="card shadow-sm border-0 mb-4 p-3">
      <div className="row align-items-center g-3">

        <div className="col-12 col-lg-6 text-center text-lg-start">
          <h4 className="fw-bold mb-0">{project.projectName}</h4>
        </div>

        <div className="col-12 col-lg-6 text-center text-lg-end">
          <span className="badge bg-danger me-2 px-3 py-2">
            {project.status}
          </span>

          <button
            className="btn btn-outline-primary btn-sm mt-2 mt-lg-0"
            onClick={downloadInvoice}
          >
            Download Invoice
          </button>
        </div>

      </div>
    </div>

    {/* ================= CUSTOMER DETAILS ================= */}
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header fw-bold bg-light">
        Customer Details
      </div>

      <div className="card-body">
        <div className="row gy-2 small">

          <div className="col-12 col-md-6">
            <strong>Name:</strong> {project.customerName}
          </div>

          <div className="col-12 col-md-6">
            <strong>Mobile:</strong> {project.customerContact}
          </div>

          <div className="col-12 col-md-6">
            <strong>Email:</strong> {project.customerEmail}
          </div>

          <div className="col-12 col-md-6">
            <strong>College:</strong> {project.customerCollege}
          </div>

          <div className="col-12 col-md-6">
            <strong>Status:</strong> {project.status}
          </div>

        </div>
      </div>
    </div>

    {/* ================= TABS ================= */}
    <div className="card shadow-sm border-0">

      {/* Scrollable Tabs for Mobile */}
      <div className="border-bottom">
        <ul className="nav nav-tabs flex-nowrap overflow-auto px-2">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "quotations" ? "active" : ""}`}
              onClick={() => setActiveTab("quotations")}
            >
              Quotations
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              Payments
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "comments" ? "active" : ""}`}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body">

        {/* ================= QUOTATIONS ================= */}
        {activeTab === "quotations" && (
          <>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
              <h5 className="mb-0 fw-semibold">Quotation History</h5>

              {quotations.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteAll("quotations")}
                >
                  Delete All Quotations
                </button>
              )}
            </div>

            {quotations.length === 0 ? (
              <p className="text-muted small">No quotations found.</p>
            ) : (
              quotations.map((q) => {
                const itemsTotal =
                  (q.items || []).reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ) || 0;

                const setup = Number(q.setupCharges || 0);
                const dev = Number(q.devCharges || 0);
                const grandTotal = itemsTotal + setup + dev;

                return (
                  <div
                    key={q.id}
                    className="card mb-3 shadow-sm border-0 bg-light quotation-card"
                  >
                    <div className="card-body">

                      {/* Top Info */}
                      <div className="d-flex flex-column flex-md-row justify-content-between small text-muted mb-2">
                        <span>
                          Date: {new Date(q.createdAt).toLocaleString()}
                        </span>
                        <span>
                          Added by: {q.username || "User"}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mb-2">
                        {(q.items || []).map((item, index) => (
                          <div
                            key={index}
                            className="border-bottom pb-1 mb-1 small"
                          >
                            <strong>{item.name || item.componentName}</strong>
                            <div>
                              Qty: {item.quantity} | ₹{item.price} | Subtotal:
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Charges */}
                      <div className="small">
                        <div>Setup Charges: ₹{setup}</div>
                        <div>Development Charges: ₹{dev}</div>
                        <div className="fw-bold mt-1">
                          Grand Total: ₹{grandTotal}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ================= PAYMENTS ================= */}
        {activeTab === "payments" && (
          <>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
              <h5 className="fw-semibold">Payment History</h5>

              {payments.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteAll("payments")}
                >
                  Delete All Payments
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <p className="text-muted small">No payments recorded.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="border-bottom pb-2 mb-2 small">
                  ₹{p.amount} — {p.mode}
                </div>
              ))
            )}
          </>
        )}

        {/* ================= COMMENTS ================= */}
        {activeTab === "comments" && (
          <>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
              <h5 className="fw-semibold">Comments</h5>

              {comments.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteAll("comments")}
                >
                  Delete All Comments
                </button>
              )}
            </div>

            {comments.length === 0 ? (
              <p className="text-muted small">No comments recorded.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="border-bottom pb-2 mb-2 small">
                  {c.text}
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>

    {/* Extra Styling */}
    <style>{`
      .quotation-card {
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        border-radius: 12px;
      }

      .quotation-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      }

      .nav-tabs .nav-link {
        white-space: nowrap;
      }
    `}</style>

  </div>
);
};

export default ClosedProjectDetails;
