import {
  NavLink,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getUser = () => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getUser);

  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  return (
    <header className="navbar">

      <Link
        to="/"
        className="brand"
      >
        <span className="brand-logo">
          R
        </span>

        <span>
          REIT Compare
        </span>
      </Link>

      <nav className="nav-links">

        <NavLink
          to="/"
          end
        >
          Dashboard
        </NavLink>

        <NavLink to="/reits">
          REITs
        </NavLink>

        <NavLink to="/invits">
  InvITs
</NavLink>

        <NavLink to="/properties">
          Properties
        </NavLink>

        <NavLink to="/compare">
          Compare
        </NavLink>

        <NavLink to="/calculator">
          Calculator
        </NavLink>

        <NavLink to="/my-investments">
          My Investments
        </NavLink>

        {/* ADMIN LINK - ONLY FOR ADMIN */}
        {user && user.role === "admin" && (
          <NavLink to="/admin/investments">
            Admin
          </NavLink>
        )}

        {/* AUTHENTICATION */}

        {user ? (
          <>
            <span
              style={{
                fontWeight: "600",
                marginLeft: "10px"
              }}
            >
              👤 {user.name}
            </span>

            <button
              onClick={handleLogout}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                color: "#dc2626",
                marginLeft: "5px"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">
              Login
            </NavLink>

            <NavLink to="/signup">
              Sign Up
            </NavLink>
          </>
        )}

      </nav>

    </header>
  );
}