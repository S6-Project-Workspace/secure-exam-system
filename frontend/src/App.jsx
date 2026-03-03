import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./app/home/Home";
import Login from "./app/auth/Login";
import Signup from "./app/auth/Signup";
import StudentDashboard from "./app/student-dashboard/StudentDashboard";
import StudentViewResult from "./app/student-dashboard/StudentViewResult";
import InstructorDashboard from "./app/instructor-dashboard/InstructorDashboard";
import CreateExam from "./app/instructor-dashboard/CreateExam";
import AddMCQs from "./app/instructor-dashboard/AddMCQs";
import InstructorKeyGen from "./app/InstructorKeyGen";
import InstructorPublish from "./InstructorPublish";
import StudentExamDecrypt from "./StudentExamDecrypt";
import InstructorEvaluate from "./InstructorEvaluate";
import StudentKeyGen from "./app/StudentKeyGen";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/keygen" element={<StudentKeyGen />} />
          <Route path="/student/decrypt/:examId" element={<StudentExamDecrypt />} />
          <Route path="/student/results/:examId" element={<StudentViewResult />} />
        </Route>

        {/* Protected Instructor Routes */}
        <Route element={<ProtectedRoute allowedRole="instructor" />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/keygen" element={<InstructorKeyGen />} />
          <Route path="/instructor/exams/create" element={<CreateExam />} />
          <Route path="/instructor/exams/:examId/questions" element={<AddMCQs />} />
          <Route path="/instructor/publish" element={<InstructorPublish />} />
          <Route path="/instructor/evaluate" element={<InstructorEvaluate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

