import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveConversation } from "../../store/slices/chatSlice";
import socketService from "../../services/socket";
import axios from "axios";

function Sidebar({ onLogout, isConnected }) {
  const { user } = useSelector((state) => state.auth);
  const { onlineUsers, activeConversation } = useSelector(
    (state) => state.chat
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const filteredUsers = response.data.filter((u) => u._id !== user._id);
      setUsers(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{user?.username}</h2>
              <div className="flex items-center space-x-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-xs text-gray-500">
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <UserItem
                key={u._id}
                user={u}
                isOnline={onlineUsers.includes(u._id)}
                isActive={activeConversation?.userId === u._id}
              />
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserItem({ user, isOnline, isActive }) {
  const dispatch = useDispatch();

  const handleUserClick = () => {
    dispatch(
      setActiveConversation({
        userId: user._id,
        username: user.username,
        email: user.email,
      })
    );

    socketService.joinConversation(user._id);
  };

  return (
    <button
      onClick={handleUserClick}
      className={`w-full px-4 py-3 transition flex items-center space-x-3 text-left ${
        isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {user.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {user.username}
          </h3>
        </div>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>
    </button>
  );
}

export default Sidebar;
