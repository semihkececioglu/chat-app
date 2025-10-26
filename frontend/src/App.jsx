import { BrowserRouter as Router, Routes, Route, Navigate } from "react";
import { useSelector } from "react-redux";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes*/}
          <Route
            path="/login"
            element={user ? <Navigate to="/chat" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/chat" /> : <Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/chat"
            element={user ? <Chat /> : <Navigate to="/login" />}
          />

          {/* Default route */}
          <Route
            path="/"
            element={<Navigate to={user ? "/chat" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
