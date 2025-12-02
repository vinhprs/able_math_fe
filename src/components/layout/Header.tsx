import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/cn";
import { LogOut, User, Settings, Bell } from "lucide-react";

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-primary-600">Able Math</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications (optional) */}
        <button
          className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Notification badge can be added here */}
        </button>

        {/* User info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-secondary-900">
            {user?.fullName || user?.username}
          </p>
          <p className="text-xs text-secondary-500">{user?.role}</p>
        </div>

        {/* User menu dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="User menu"
          >
            {getInitials(user?.fullName)}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-secondary-200">
                <p className="text-sm font-medium text-secondary-900">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  navigate("/settings");
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-secondary-200 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

