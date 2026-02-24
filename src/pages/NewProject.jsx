import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import PaymentForm from "../components/PaymentForm";
import CommentSection from "../components/CommentSection";

const NewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);

  const [components, setComponents] = useState([]);
  const [quotationHistory, setQuotationHistory] = useState([]);

  const [allComponents, setAllComponents] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(true);

  const [componentName, setComponentName] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");

  const [setupCharges, setSetupCharges] = useState(0);
  const [devCharges, setDevCharges] = useState(0);

  const [savingQuotation, setSavingQuotation] = useState(false);

  const dropdownRef = useRef(null);

  // 🔥 NEW STATES FOR EDIT CUSTOMER
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");

  /* ================= FETCH PROJECT ================= */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`https://smarttechsolutions-backend.onrender.com/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          alert("Project not found");
          return;
        }

        const data = await response.json();
        setProject(data);
        setEditedProject(data); // 🔥 add this line
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
    fetchQuotationHistory();
  }, [id]);

  // ------------------- new edit customer details

  const saveCustomerDetails = async () => {
    try {
      const response = await fetch(`https://smarttechsolutions-backend.onrender.com/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedProject),
      });

      if (!response.ok) return;

      const updated = await response.json();
      setProject(updated);
      setEditedProject(updated);
      setEditingCustomer(false);

      // ✅ Show inline message instead of alert
      setUpdateMessage("Customer details updated successfully.");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  /* ================= FETCH COMPONENTS ================= */
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoadingComponents(true);
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

  /* ================= FETCH QUOTATION HISTORY ================= */
  const fetchQuotationHistory = async () => {
    try {
      const response = await fetch(
        `https://smarttechsolutions-backend.onrender.com/project/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <--- must be valid JWT
          },
          credentials: "include", // <--- ensures browser sends credentials for CORS
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuotationHistory(data);
    } catch (error) {
      console.error("Error loading quotation history:", error);
    }
  };

  /* ================= CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTER COMPONENTS ================= */
  const filteredComponents =
    componentName.length >= 2
      ? allComponents.filter((c) =>
          c.name.toLowerCase().includes(componentName.toLowerCase()),
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

    if (quantity > selectedComponent.quantity) {
      alert("Quantity exceeds available stock!");
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

  /* ================= EDIT COMPONENT ================= */
  const updateComponent = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = Number(value);
    setComponents(updated);
  };

  const totalComponents = components.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const grandTotal =
    totalComponents + Number(setupCharges) + Number(devCharges);

  /* ================= SAVE QUOTATION ================= */
  const saveQuotation = async () => {
    if (components.length === 0) {
      alert("Add at least one component");
      return;
    }

    try {
      setSavingQuotation(true);

      await fetch(`https://smarttechsolutions-backend.onrender.com/quotations/project/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          items: components.map((c) => ({
            componentName: c.name,
            quantity: c.quantity,
            price: c.price,
          })),
          setupCharges,
          devCharges,
          totalAmount: grandTotal,
        }),
      });

      alert("Quotation saved successfully!");
      setComponents([]);
      setSetupCharges(0);
      setDevCharges(0);

      fetchQuotationHistory();
    } catch (error) {
      console.error("Error saving quotation");
    } finally {
      setSavingQuotation(false);
    }
  };

  /* ================= close project ================= */
  const closeProject = async () => {
    const confirmClose = window.confirm(
      "Are you sure you want to close this project?",
    );

    if (!confirmClose) return;

    try {
      const response = await fetch(
        `https://smarttechsolutions-backend.onrender.com/projects/${id}/close`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        alert("Failed to close project");
        return;
      }

      alert("Project closed successfully!");

      // 🔥 Redirect to read-only page
      navigate(`/closed-project/${id}`);
    } catch (error) {
      console.error("Error closing project:", error);
      alert("Server error while closing project");
    }
  };

  if (!project) {
    return <div className="container mt-5">Loading project...</div>;
  }

  const canEditCustomer = quotationHistory.length === 0;

  return (
    <div className="container-fluid py-3 px-2 px-md-4 pb-5">
      {/* ================= CUSTOMER + PAYMENT ================= */}
      <div className="card p-4 mb-4 shadow-sm">
        <div className="row">
          <div className="col-md-8 mb-3">
            <h4>Customer Details</h4>

            {updateMessage && (
              <div className="alert alert-success py-2">{updateMessage}</div>
            )}

            {editingCustomer ? (
              <>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Project Name
                    </label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.projectName || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          projectName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Customer Name
                    </label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.customerName || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Contact</label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.customerContact || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          customerContact: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.customerEmail || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          customerEmail: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">College</label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.customerCollege || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          customerCollege: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Branch</label>
                    <input
                      className="form-control form-control-sm"
                      value={editedProject.customerBranch || ""}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          customerBranch: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn btn-success btn-sm"
                  onClick={saveCustomerDetails}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Project Name:</strong> {project.projectName}
                </p>
                <p>
                  <strong>Customer Name:</strong> {project.customerName}
                </p>
                <p>
                  <strong>Contact:</strong> {project.customerContact}
                </p>
                <p>
                  <strong>Email:</strong> {project.customerEmail}
                </p>
                <p>
                  <strong>College:</strong> {project.customerCollege}
                </p>
                <p>
                  <strong>Branch:</strong> {project.customerBranch}
                </p>

                {canEditCustomer && (
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setEditingCustomer(true)}
                  >
                    Edit Customer Details
                  </button>
                )}
              </>
            )}
          </div>

          {/* Payment Form */}

          <PaymentForm
            projectId={id}
            username={localStorage.getItem("username")}
          />
        </div>
      </div>
      {/* ================= CREATE + HISTORY ================= */}
      <div className="row g-4">
        {/* CREATE QUOTATION */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Create Quotation</h5>

              {/* Search Row */}
              <div
                className="row g-2 align-items-end mb-3 position-relative"
                ref={dropdownRef}
              >
                <div className="col-12 col-md-5">
                  <input
                    type="text"
                    className="form-control form-control-sm"
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
                    className="form-control form-control-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>

                <div className="col-6 col-md-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={price}
                    readOnly
                  />
                </div>

                <div className="col-12 col-md-3">
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={addComponent}
                  >
                    Add Component
                  </button>
                </div>

                {showDropdown && filteredComponents.length > 0 && (
                  <div
                    className="card shadow position-absolute w-100"
                    style={{
                      zIndex: 1000,
                      top: "100%",
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
                        {c.name}
                        <br />
                        <small>
                          ₹{c.price} | Remaining: {c.quantity}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table */}
              {components.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.quantity}
                              onChange={(e) =>
                                updateComponent(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.price}
                              onChange={(e) =>
                                updateComponent(index, "price", e.target.value)
                              }
                            />
                          </td>
                          <td>{item.quantity * item.price}</td>
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
              )}

              {/* Totals Section */}
              <div className="row g-3 mt-2">
                <div className="col-12">
                  <strong>Total (Components): {totalComponents}</strong>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small">Setup Charges</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={setupCharges}
                    onChange={(e) => setSetupCharges(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small">
                    Development Charges
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={devCharges}
                    onChange={(e) => setDevCharges(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <h6 className="fw-bold">Grand Total: {grandTotal}</h6>
                </div>
              </div>

              <div className="mt-3 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-primary btn-sm px-4"
                  onClick={saveQuotation}
                  disabled={savingQuotation}
                >
                  {savingQuotation ? "Saving..." : "Save Quotation"}
                </button>

                <button
                  className="btn btn-outline-danger btn-sm px-4"
                  onClick={closeProject}
                >
                  Close Project
                </button>
              </div>

              <div className="mt-4">
                <CommentSection
                  projectId={id}
                  username={localStorage.getItem("username")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Quotation History</h5>

              {quotationHistory.length === 0 ? (
                <p className="text-muted small">No quotations yet.</p>
              ) : (
                quotationHistory.map((q) => (
                  <div
                    key={q.id}
                    className="card mb-3 bg-light border-0 shadow-sm"
                  >
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
                      <div className="fw-bold">
                        Grand Total: ₹{q.totalAmount}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProject;




