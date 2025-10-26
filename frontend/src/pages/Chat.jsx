import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import socketService from "../services/socket";

function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Connect to socket when component mounts
    if (user && user.token) {
      socketService.connect(user.token);
    }

    // Cleanup: disconnect when component unmounts
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Chat!
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            Hello,{" "}
            <span className="font-semibold text-blue-600">
              {user?.username}
            </span>
            !
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800 font-medium mb-2">
              Authentication Working!
            </p>
            <p className="text-sm text-green-700">
              You've successfully logged in. Socket.io is connecting...
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500 font-medium">User ID:</p>
              <p className="text-gray-900 font-mono text-xs break-all">
                {user?._id}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500 font-medium">Email:</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-gray-600 text-sm">
              Chat interface coming soon in Day 4!
            </p>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition duration-150 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
