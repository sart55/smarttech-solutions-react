import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TemporaryQuotationPage = () => {
  const token = localStorage.getItem("token");

  /* ================= STATES ================= */
  const [step, setStep] = useState(1);

  const [customer, setCustomer] = useState({
    projectName: "",
    customerName: "",
    contact: "",
    email: "",
    college: "",
    branch: "",
  });

  const [allComponents, setAllComponents] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [components, setComponents] = useState([]);

  const [componentName, setComponentName] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");

  const [setupCharges, setSetupCharges] = useState(0);
  const [devCharges, setDevCharges] = useState(0);

  const dropdownRef = useRef(null);

  /* ================= FETCH COMPONENTS ================= */
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch("https://smarttechsolutions-backend.onrender.com/components", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAllComponents(data);
      } catch (error) {
        console.error("Error fetching components");
      } finally {
        setLoadingComponents(false);
      }
    };
    fetchComponents();
  }, []);

  /* ================= CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= CUSTOMER ================= */
  const handleCustomerChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (
      !customer.projectName ||
      !customer.customerName ||
      !customer.contact ||
      !customer.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    setStep(2);
  };

  /* ================= FILTER COMPONENTS ================= */
  const filteredComponents =
    componentName.length >= 2
      ? allComponents.filter((c) =>
          c.name.toLowerCase().includes(componentName.toLowerCase())
        )
      : [];

  /* ================= SELECT COMPONENT ================= */
  const selectComponent = (component) => {
    setSelectedComponent(component);
    setComponentName(component.name);
    setPrice(component.price);
    setShowDropdown(false);
  };

  /* ================= ADD COMPONENT ================= */
  const addComponent = () => {
    if (!selectedComponent) {
      alert("Please select valid component");
      return;
    }

    const newComponent = {
      name: selectedComponent.name,
      quantity: Number(quantity),
      price: Number(price),
    };

    setComponents([...components, newComponent]);

    setComponentName("");
    setSelectedComponent(null);
    setQuantity(1);
    setPrice("");
  };

  /* ================= REMOVE COMPONENT ================= */
  const removeComponent = (index) => {
    const updated = [...components];
    updated.splice(index, 1);
    setComponents(updated);
  };

  /* ================= UPDATE COMPONENT ================= */
  const updateComponent = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = Number(value);
    setComponents(updated);
  };

  /* ================= TOTALS ================= */
  const totalComponents = components.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const grandTotal =
    totalComponents + Number(setupCharges) + Number(devCharges);

  /* ================= PDF DOWNLOAD ================= */
 const downloadPDF = () => {
  if (components.length === 0) {
    alert("Add at least one component!");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const primary = [30, 58, 95];
  const accent = [52, 152, 219];
  const light = [245, 247, 250];

  const invoiceNumber = `TMP-${Date.now()}`;
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
  doc.text("TEMPORARY QUOTATION", pageWidth - 20, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Quotation No: ${invoiceNumber}`, pageWidth - 20, 27, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, pageWidth - 20, 33, { align: "right" });

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
  doc.text(`Project Name: ${customer.projectName}`, 20, y);
  doc.text(`Customer Name: ${customer.customerName}`, pageWidth / 2, y);
  y += 8;
  doc.text(`Contact: ${customer.contact}`, 20, y);
  doc.text(`Email: ${customer.email}`, pageWidth / 2, y);
  y += 8;
  doc.text(`College: ${customer.college}`, 20, y);
  doc.text(`Branch: ${customer.branch}`, pageWidth / 2, y);

  // ===== COMPONENT TABLE =====
  y += 20;

  autoTable(doc, {
    startY: y,
    head: [["Component", "Qty", "Unit Price", "Total"]],
    body: components.map((item) => [
      item.name,
      item.quantity,
      `Rs ${item.price}`,
      `Rs ${item.quantity * item.price}`,
    ]),
    theme: "grid",
    styles: { fontSize: 11 },
    headStyles: {
      fillColor: primary,
      textColor: 255,
    },
  });

  let finalY = doc.lastAutoTable.finalY + 15;

  const boxWidth = 80;
  const boxX = pageWidth - boxWidth - 20;

  doc.setFillColor(235, 235, 235);
  doc.roundedRect(boxX, finalY - 10, boxWidth, 30, 4, 4, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.text(`Setup Charges: Rs ${setupCharges}`, boxX + 5, finalY);
  doc.text(`Development Charges: Rs ${devCharges}`, boxX + 5, finalY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Grand Total: Rs ${grandTotal}`, boxX + 5, finalY + 18);

  const footerY = doc.internal.pageSize.getHeight() - 25;

  doc.setDrawColor(...accent);
  doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Thank you for trusting SmartTech Solutions.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.setFont("helvetica", "bold");
  doc.text(
    "Contact: 8805205049 | 8055335650 | 8446052814",
    pageWidth / 2,
    footerY + 8,
    { align: "center" }
  );

  doc.save(`${customer.projectName}-${customer.contact}-TemporaryQuotation.pdf`);
};

return (
  <div className="container-fluid px-2 px-md-4 py-4">

    <div className="text-center mb-4">
      <h4 className="fw-bold responsive-title">
        Temporary Quotation
      </h4>
    </div>

    {/* ================= STEP 1 ================= */}
    {step === 1 && (
      <div className="card shadow-sm border-0 rounded-4 p-3 p-md-4 mb-4">

        <h5 className="fw-bold text-primary mb-4 text-center text-md-start">
          Customer Information
        </h5>

        <form onSubmit={handleContinue}>
          <div className="row g-3">

            <div className="col-12 col-md-6">
              <input
                type="text"
                required
                className="form-control"
                placeholder="Project Name"
                name="projectName"
                value={customer.projectName}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <input
                type="text"
                required
                className="form-control"
                placeholder="Customer Name"
                name="customerName"
                value={customer.customerName}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <input
                type="tel"
                pattern="[0-9]{10}"
                required
                className="form-control"
                placeholder="Contact (10 digits)"
                name="contact"
                value={customer.contact}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <input
                type="email"
                required
                className="form-control"
                placeholder="Email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="College"
                name="college"
                value={customer.college}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Branch"
                name="branch"
                value={customer.branch}
                onChange={handleCustomerChange}
              />
            </div>

          </div>

          <div className="d-grid d-md-flex justify-content-md-end mt-4">
            <button className="btn btn-primary px-4">
              Continue to Components
            </button>
          </div>
        </form>
      </div>
    )}

    {/* ================= STEP 2 ================= */}
    {step === 2 && (
      <>
        {/* CUSTOMER DETAILS */}
        <div className="card shadow-sm border-0 rounded-4 p-3 p-md-4 mb-4">
          <h6 className="fw-bold mb-3 text-dark">
            Customer Details
          </h6>

          <div className="row gy-2 small">

            <div className="col-12 col-md-4">
              <strong>Name:</strong> {customer.customerName}
            </div>

            <div className="col-12 col-md-4">
              <strong>Contact:</strong> {customer.contact}
            </div>

            <div className="col-12 col-md-4">
              <strong>Email:</strong> {customer.email}
            </div>

            <div className="col-12 col-md-6">
              <strong>College:</strong> {customer.college}
            </div>

            <div className="col-12 col-md-6">
              <strong>Branch:</strong> {customer.branch}
            </div>

          </div>
        </div>

        {/* ADD COMPONENT */}
        <div className="card shadow-sm border-0 rounded-4 p-3 p-md-4 mb-4">
          <h6 className="fw-bold text-primary mb-3">
            Add Components
          </h6>

          <div className="row g-3 position-relative" ref={dropdownRef}>

            <div className="col-12 col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search component..."
                value={componentName}
                onChange={(e) => {
                  setComponentName(e.target.value);
                  setShowDropdown(true);
                }}
              />
            </div>

            <div className="col-6 col-md-2">
              <input
                type="number"
                min="1"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="col-6 col-md-2">
              <input
                type="number"
                className="form-control"
                value={price}
                readOnly
              />
            </div>

            <div className="col-12 col-md-3 d-grid">
              <button
                className="btn btn-primary"
                onClick={addComponent}
              >
                Add Component
              </button>
            </div>

            {/* Dropdown */}
            {showDropdown && filteredComponents.length > 0 && (
              <div
                className="card shadow-sm position-absolute w-100"
                style={{
                  zIndex: 1000,
                  top: "60px",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {filteredComponents.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 border-bottom small"
                    style={{ cursor: "pointer" }}
                    onClick={() => selectComponent(c)}
                  >
                    <div className="fw-semibold">{c.name}</div>
                    <small className="text-muted">
                      ₹{c.price} | Stock: {c.quantity}
                    </small>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* COMPONENT TABLE */}
        {components.length > 0 && (
          <div className="card shadow-sm border-0 rounded-4 p-3 p-md-4 mb-4">
            <h6 className="fw-bold text-secondary mb-3">
              Selected Components
            </h6>

            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-sm"
                          value={item.quantity}
                          onChange={(e) =>
                            updateComponent(index, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          value={item.price}
                          onChange={(e) =>
                            updateComponent(index, "price", e.target.value)
                          }
                        />
                      </td>
                      <td className="fw-semibold">
                        ₹{item.quantity * item.price}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeComponent(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUMMARY */}
        <div className="card shadow border-0 rounded-4 p-3 p-md-4 bg-light">
          <h6 className="fw-bold text-success mb-3">
            Summary & Charges
          </h6>

          <div className="mb-2 small">
            <strong>Total (Components):</strong> ₹{totalComponents}
          </div>

          <div className="row g-3">

            <div className="col-12 col-md-6">
              <label className="fw-semibold small">
                Setup Charges
              </label>
              <input
                type="number"
                min="0"
                className="form-control form-control-sm"
                value={setupCharges}
                onChange={(e) =>
                  setSetupCharges(e.target.value)
                }
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="fw-semibold small">
                Development Charges
              </label>
              <input
                type="number"
                min="0"
                className="form-control form-control-sm"
                value={devCharges}
                onChange={(e) =>
                  setDevCharges(e.target.value)
                }
              />
            </div>

          </div>

          <hr />

          <div className="fw-bold fs-6">
            Grand Total: ₹{grandTotal}
          </div>

          <div className="d-grid d-md-flex justify-content-md-end mt-3">
            <button
              className="btn btn-success px-4"
              onClick={downloadPDF}
            >
              Download Temporary Quotation
            </button>
          </div>
        </div>
      </>
    )}

  </div>
);
};

export default TemporaryQuotationPage;