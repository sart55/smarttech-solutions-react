import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";

function AdminPage() {
  const loggedInUser = localStorage.getItem("username") || "Admin";
  const fileInputRef = useRef(null);

  const [components, setComponents] = useState([]);
  const [pendingComponents, setPendingComponents] = useState([]);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notifyText, setNotifyText] = useState("");
  const [notifyVisible, setNotifyVisible] = useState(false);

  const notifyTimerRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadComponents();
    return () => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    };
  }, []);

  /* ================= LOAD ================= */

  const loadComponents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/components");
      setComponents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= NAME SUGGESTIONS ================= */

  const handleNameChange = (value) => {
    setNewName(value);

    if (value.length > 0) {
      const filtered = components.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (comp) => {
    setNewName(comp.name);
    setNewPrice(comp.price);
    setNewQuantity(comp.quantity);
    setSuggestions([]);
  };

  /* ================= ADD TO PENDING ================= */

  const addComponent = () => {
    if (!newName || !newPrice || !newQuantity) {
      alert("Fill all fields");
      return;
    }

    const newComp = {
      name: newName,
      price: Number(newPrice),
      quantity: Number(newQuantity),
    };

    setPendingComponents([...pendingComponents, newComp]);

    setNewName("");
    setNewPrice("");
    setNewQuantity("");
  };

  /* ================= UPDATE PENDING ================= */

  const updatePendingComponent = (index, field, value) => {
    const updated = [...pendingComponents];
    updated[index][field] =
      field === "name" ? value : Number(value);
    setPendingComponents(updated);
  };

  const removePendingComponent = (index) => {
    const updated = pendingComponents.filter((_, i) => i !== index);
    setPendingComponents(updated);
  };

  /* ================= SAVE ================= */

  const saveComponents = async () => {
    if (pendingComponents.length === 0) return;

    try {
      setSaving(true);

      for (let comp of pendingComponents) {
        await api.post("/components", comp);
      }

      const count = pendingComponents.length;
      setPendingComponents([]);
      await loadComponents();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setNotifyText(`${count} component(s) added`);
      setNotifyVisible(true);

      setTimeout(() => {
        setNotifyVisible(false);
      }, 1500);
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ================= EDIT EXISTING ================= */

  const startEdit = (c) => {
    setEditingId(c.id);
    setNewName(c.name);
    setNewPrice(c.price);
    setNewQuantity(c.quantity);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEdit = async () => {
    await api.put(`/components/${editingId}`, {
      name: newName,
      price: Number(newPrice),
      quantity: Number(newQuantity),
    });

    setEditingId(null);
    setNewName("");
    setNewPrice("");
    setNewQuantity("");
    loadComponents();
  };

  const deleteComponent = async (id) => {
    if (!window.confirm("Delete this component?")) return;
    await api.delete(`/components/${id}`);
    loadComponents();
  };

  /* ================= EXCEL ================= */

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const imported = rows.map((row) => ({
        name: row.name,
        price: Number(row.price) || 0,
        quantity: Number(row.quantity) || 0,
      }));

      setPendingComponents((prev) => [...prev, ...imported]);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(components.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const currentRows = components.slice(
    indexOfLastRow - rowsPerPage,
    indexOfLastRow
  );

  /* ================= UI ================= */

return (
  <div className="container-fluid py-3 px-2 px-md-4">

    {/* ===== HEADER ===== */}
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
      <h4 className="fw-bold mb-2 mb-md-0 text-center text-md-start">
        Admin Panel
      </h4>

      <div className="text-center text-md-end">
        <span className="badge bg-dark px-3 py-2 fs-6">
          Total: {components.length}
        </span>
      </div>
    </div>

    {/* ================= ADD / EDIT SECTION ================= */}
    <div className="card border-0 shadow-sm rounded-3 mb-4">
      <div className="card-body">

        <div className="row g-3">

          {/* Component Name */}
          <div className="col-12 col-md-4 position-relative">
            <label className="form-label fw-semibold small">
              Component Name
            </label>
            <input
              type="text"
              className="form-control form-control-sm form-control-md"
              placeholder="Enter component name"
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            {suggestions.length > 0 && (
              <div
                className="list-group position-absolute w-100 mt-1 shadow-sm"
                style={{ zIndex: 1000 }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="list-group-item list-group-item-action small"
                    onClick={() => selectSuggestion(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="col-6 col-md-2">
            <label className="form-label fw-semibold small">
              Price
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="col-6 col-md-2">
            <label className="form-label fw-semibold small">
              Quantity
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
          </div>

          {/* Button */}
          <div className="col-12 col-md-2 d-grid">
            {editingId ? (
              <button
                className="btn btn-warning btn-sm fw-semibold"
                onClick={saveEdit}
              >
                Save Update
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm fw-semibold"
                onClick={addComponent}
              >
                Add Component
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* ================= BULK UPLOAD ================= */}
    <div className="card border-0 shadow-sm rounded-3 mb-4">
      <div className="card-body">
        <h6 className="fw-bold mb-3">Bulk Upload</h6>

        <input
          type="file"
          className="form-control form-control-sm"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          ref={fileInputRef}
        />
      </div>
    </div>

    {/* ================= PENDING ================= */}
    {pendingComponents.length > 0 && (
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Pending Components</h6>

          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingComponents.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={c.name}
                        onChange={(e) =>
                          updatePendingComponent(i, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={c.price}
                        onChange={(e) =>
                          updatePendingComponent(i, "price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={c.quantity}
                        onChange={(e) =>
                          updatePendingComponent(i, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removePendingComponent(i)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-grid d-md-flex justify-content-md-end mt-3">
            <button
              className="btn btn-success px-4 fw-semibold"
              onClick={saveComponents}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Components"}
            </button>
          </div>
        </div>
      </div>
    )}

    {notifyVisible && (
      <div className="alert alert-success text-center shadow-sm small">
        {notifyText}
      </div>
    )}

    {/* ================= ALL COMPONENTS ================= */}
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body">
        <h6 className="fw-bold mb-3">All Components</h6>

        {loading ? (
          <div className="text-center py-4 small fw-semibold">
            Loading components...
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-bordered table-sm align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Updated By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.price}</td>
                      <td>{c.quantity}</td>
                      <td>{c.lastUpdatedBy}</td>
                      <td>
                        <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteComponent(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-center align-items-center mt-3 gap-3 flex-wrap">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>

              <span className="fw-semibold small">
                Page {currentPage} / {totalPages || 1}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>

  </div>
);
}

export default AdminPage;