import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomerDetailsPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    customerName: "",
    contactNumber: "",
    email: "",
    college: "",
    branch: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://smarttechsolutions-backend.onrender.com/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  credentials: "include", // <--- Important
  body: JSON.stringify({
    projectName: formData.projectName,
    customerName: formData.customerName,
    customerContact: formData.contactNumber,
    customerEmail: formData.email,
    customerCollege: formData.college,
    customerBranch: formData.branch,
    description: formData.description
  }),
});

      if (!response.ok) {
        const message = await response.text();
        alert(message); // ✅ Shows duplicate message
        return;
      }

      const savedProject = await response.json();

      // ✅ Navigate only if success
      navigate(`/NewProject/${savedProject.id}`);

    } catch (error) {
      console.error("Error creating project:", error);
      alert("Server error");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <div className="card shadow-lg p-5" style={{ width: "100%", maxWidth: "900px", borderRadius: "20px" }}>
        <h2 className="fw-bold mb-2">Enter Customer Details</h2>
        <p className="text-muted mb-4">
          Fill the form below to quotation.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-md-6 mb-3">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                name="projectName"
                className="form-control"
                value={formData.projectName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                name="customerName"
                className="form-control"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                className="form-control"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">College</label>
              <input
                type="text"
                name="college"
                className="form-control"
                value={formData.college}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Branch</label>
              <input
                type="text"
                name="branch"
                className="form-control"
                value={formData.branch}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn w-100 text-white fw-semibold"
              style={{
                background: "linear-gradient(90deg, #0d6efd, #0056d2)",
                padding: "12px",
                borderRadius: "12px",
              }}
            >
              Continue to Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;