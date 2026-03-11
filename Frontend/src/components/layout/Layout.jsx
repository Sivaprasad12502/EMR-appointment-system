import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../../context/UseContex";
import {
  FaHome,
  FaCalendarAlt,
  FaUserMd,
  FaUsers,
  FaUserInjured,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

const Layout = ({ children }) => {
  const { user, logout } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

 
  const getNavItems = () => {
    const commonItems = [
      { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    ];

    if (user?.role === "super_admin") {
      return [
        ...commonItems,
        { path: "/admin", label: "Manage Users", icon: <FaUsers /> },
        { path: "/doctors", label: "Doctors", icon: <FaUserMd /> },
        {
          path: "/appointments",
          label: "Appointments",
          icon: <FaCalendarAlt />,
        },
        { path: "/patients", label: "Patients", icon: <FaUserInjured /> },
      ];
    } else if (user?.role === "receptionist") {
      return [
        ...commonItems,
        {
          path: "/appointments",
          label: "Appointments",
          icon: <FaCalendarAlt />,
        },
        {
          path: "/appointments/new",
          label: "Book Appointment",
          icon: <FaCalendarAlt />,
        },
        { path: "/patients", label: "Patients", icon: <FaUserInjured /> },
        { path: "/doctors", label: "Doctors", icon: <FaUserMd /> },
      ];
    } else if (user?.role === "doctor") {
      return [
        ...commonItems,
        {
          path: "/appointments",
          label: "My Appointments",
          icon: <FaCalendarAlt />,
        },
        { path: "/schedule", label: "My Schedule", icon: <FaCog /> },
      ];
    } else if (user?.role === "patient") {
      return [
        ...commonItems,
        {
          path: "/appointments",
          label: "My Appointments",
          icon: <FaCalendarAlt />,
        },
        {
          path: "/appointments/new",
          label: "Book Appointment",
          icon: <FaCalendarAlt />,
        },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaUserMd className="text-blue-600 text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">
                EMR Appointment System
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="mt-5 px-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
