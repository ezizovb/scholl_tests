import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import CreateTestPage from "./pages/CreateTestPage";
import AddQuestionPage from "./pages/AddQuestionPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import TakeTestPage from "./pages/TakeTestPage";
import StudentResultsPage from "./pages/StudentResultsPage";
import StudentResultDetailsPage from "./pages/StudentResultDetailsPage";
import TeacherResultsPage from "./pages/TeacherResultsPage";
import EditTestPage from "./pages/EditTestPage";
import TeacherResultDetailsPage from "./pages/TeacherResultDetailsPage";
import RegistrationPage from "./pages/RegistrationPage";
import CreateGroup from "./pages/CreateGroup";
import GlobalStyles from "./components/GlobalStyles";

// Заглушки для будущих страниц
// const TeacherDashboard = () => <h2>Панель учителя</h2>;
// const StudentDashboard = () => <h2>Панель ученика</h2>;

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Проверяем, есть ли пользователь в localStorage при загрузке
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage setLoggedInUser={setLoggedInUser} />}
        />
        <Route path="/register" element={<RegistrationPage />} />

        {loggedInUser && loggedInUser.role === "teacher" ? (
          <>
            <Route path="/teacher" element={<TeacherDashboardPage />} />
            <Route path="/teacher/create-test" element={<CreateTestPage />} />
            <Route
              path="/teacher/add-question/:testId"
              element={<AddQuestionPage />}
            />
            <Route path="/teacher/results" element={<TeacherResultsPage />} />
            <Route
              path="/teacher/edit-test/:testId"
              element={<EditTestPage />}
            />
            <Route
              path="/teacher/results/:resultId/details"
              element={<TeacherResultDetailsPage />}
            />
          </>
        ) : (
          <Route path="/teacher" element={<Navigate to="/login" />} />
        )}

        {loggedInUser && loggedInUser.role === "student" ? (
          <>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route
              path="/student/take-test/:testId"
              element={<TakeTestPage />}
            />
            <Route path="/student/results" element={<StudentResultsPage />} />
            <Route
              path="/student/results/:resultId"
              element={<StudentResultDetailsPage />}
            />
          </>
        ) : (
          <Route path="/student" element={<Navigate to="/login" />} />
        )}

        <Route
          path="/"
          element={
            <Navigate
              to={
                loggedInUser
                  ? loggedInUser.role === "teacher"
                    ? "/teacher"
                    : "/student"
                  : "/login"
              }
            />
          }
        />
        <Route path="/teacher/create-group" element={<CreateGroup />} />
      </Routes>
    </Router>
  );
};

export default App;
