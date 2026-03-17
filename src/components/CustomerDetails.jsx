import { useState, useEffect } from "react";

const CustomerDetails = ({ projectId, token }) => {
  const [project, setProject] = useState(null);

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");

  /* ================= FETCH PROJECT ================= */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          alert("Project not found");
          return;
        }

        const data = await response.json();
        setProject(data);
        setEditedProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId, token]);

  const saveCustomerDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedProject),
        },
      );

      if (!response.ok) return;

      const updated = await response.json();
      setProject(updated);
      setEditedProject(updated);
      setEditingCustomer(false);

      // setUpdateMessage("Customer details updated successfully.");
      // setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div>
      <div className="card p-4 mb-4 shadow-sm" style={{maxHeight:"420px"}}>
      <h5 className="fw-bold mb-3">Customer Details</h5>

      <div className="card p-3 mb-3">
        {updateMessage && (
          <div className="alert alert-success py-2">{updateMessage}</div>
        )}

        {editingCustomer ? (
          <>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Project Name</label>
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
                <label className="form-label fw-semibold">Customer Name</label>
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

            <button
              className="btn btn-primary mt-2"
              onClick={() => setEditingCustomer(true)}
            >
              Edit Customer Details
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
