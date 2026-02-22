import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Tenants from "./pages/dashboard/Tenants";
import UsersPage from "./pages/dashboard/UsersPage";
import Departments from "./pages/dashboard/Departments";
import Programs from "./pages/dashboard/Programs";
import Subjects from "./pages/dashboard/Subjects";
import Batches from "./pages/dashboard/Batches";
import Classrooms from "./pages/dashboard/Classrooms";
import BulkImport from "./pages/dashboard/BulkImport";
import FacultyWorkload from "./pages/dashboard/FacultyWorkload";
import TimetablePage from "./pages/dashboard/TimetablePage";
import MarksLock from "./pages/dashboard/MarksLock";
import CompliancePage from "./pages/dashboard/CompliancePage";
import MarksApproval from "./pages/dashboard/MarksApproval";
import ODApproval from "./pages/dashboard/ODApproval";
import DeptStats from "./pages/dashboard/DeptStats";
import AttendancePage from "./pages/dashboard/AttendancePage";
import MarksEntry from "./pages/dashboard/MarksEntry";
import ODRequests from "./pages/dashboard/ODRequests";
import MyAttendance from "./pages/dashboard/MyAttendance";
import MyMarks from "./pages/dashboard/MyMarks";
import ApplyOD from "./pages/dashboard/ApplyOD";
import BillingPage from "./pages/dashboard/BillingPage";
import Assignments from "./pages/dashboard/Assignments";
import EndSemesterResults from "./pages/dashboard/EndSemesterResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="departments" element={<Departments />} />
              <Route path="programs" element={<Programs />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="batches" element={<Batches />} />
              <Route path="classrooms" element={<Classrooms />} />
              <Route path="bulk-import" element={<BulkImport />} />
              <Route path="faculty-workload" element={<FacultyWorkload />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="marks-lock" element={<MarksLock />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="marks-approval" element={<MarksApproval />} />
              <Route path="od-approval" element={<ODApproval />} />
              <Route path="dept-stats" element={<DeptStats />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks-entry" element={<MarksEntry />} />
              <Route path="od-requests" element={<ODRequests />} />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="my-marks" element={<MyMarks />} />
              <Route path="apply-od" element={<ApplyOD />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="end-semester-results" element={<EndSemesterResults />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
