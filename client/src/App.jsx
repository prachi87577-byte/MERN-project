import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Apply from "./pages/Apply";
import ApplicationDetail from "./pages/ApplicationDetail";
import { JobForm, ManageJobs } from "./pages/ManageJobs";
import { AdminApplications, AdminJobs, AdminUsers } from "./pages/AdminManage";
import NotFound, { Unauthorized } from "./pages/NotFound";

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route element={<SiteLayout />}>
    <Route index element={<Home />} />
    <Route path="jobs" element={<Jobs />} />
    <Route path="jobs/:id" element={<JobDetail />} />
    <Route path="login" element={<AuthPage mode="login" />} />
    <Route path="register" element={<AuthPage mode="register" />} />
    <Route path="unauthorized" element={<Unauthorized />} />
    <Route element={<ProtectedRoute />}>
      <Route path="profile" element={<Profile />} />
      <Route path="applications/:id" element={<ApplicationDetail />} />
    </Route>
    <Route element={<ProtectedRoute roles={["applicant"]} />}>
      <Route path="applicant" element={<Dashboard />} />
      <Route path="apply/:jobId" element={<Apply />} />
      <Route path="applications" element={<Applications />} />
    </Route>
    <Route element={<ProtectedRoute roles={["recruiter"]} />}>
      <Route path="recruiter" element={<Dashboard />} />
      <Route path="recruiter/jobs/manage" element={<ManageJobs />} />
      <Route path="recruiter/jobs/new" element={<JobForm />} />
      <Route path="recruiter/jobs/:id/edit" element={<JobForm />} />
      <Route path="recruiter/jobs/:jobId/applications" element={<Applications />} />
    </Route>
    <Route element={<ProtectedRoute roles={["admin"]} />}>
      <Route path="admin" element={<Dashboard />} />
      <Route path="admin/users" element={<AdminUsers />} />
      <Route path="admin/jobs" element={<AdminJobs />} />
      <Route path="admin/applications" element={<AdminApplications />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route></Routes></AuthProvider></BrowserRouter>;
}
