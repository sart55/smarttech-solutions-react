import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import ProjectComponents from "./pages/ProjectComponents";
import AdminPage from "./pages/AdminPage";
import ComponentsHistory from "./pages/ComponentsHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ClosedProjectDetails from "./pages/ClosedProjectDetails";
import NewProject from "./pages/NewProject";
import TemporaryQuotationPage from "./pages/TemporaryQuotationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTE ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= PROTECTED ROUTES ================= */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ComponentHistory"
          element={
            <ProtectedRoute>
              <Layout>
                <ComponentsHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

       <Route
  path="/temporary-quotation"
  element={
    <ProtectedRoute>
      <Layout>
        <TemporaryQuotationPage />
      </Layout>
    </ProtectedRoute>
  }
/>

        {/* All Projects */}
        <Route
          path="/all-projects"
          element={
            <ProtectedRoute>
              <Layout>
                <Projects />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/NewProject/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <NewProject />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/closed-project/:projectId"
          element={
            <ProtectedRoute>
              <Layout>
                <ClosedProjectDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* New Project - Customer Details */}
        <Route
          path="/CustomerDetailsPage"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Project Components */}
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectComponents />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Components History */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <ComponentsHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Page */}
        <Route
          path="/AdminPage"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
