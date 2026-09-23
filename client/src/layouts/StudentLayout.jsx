import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, BookOpen, GraduationCap, Bell, Palette, LogOut, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ThemeProvider, useTheme, themes } from "../context/ThemeContext.jsx";
import { getNotifications } from "../api/student.js";
import "./StudentLayout.css";

function menuItems(currentTheme) {
  const street = currentTheme === "streetwear";
  return [
    { id: "parcours", label: street ? '"PARCOURS"' : "Mon Parcours", icon: Compass, path: "/dashboard" },
    { id: "cours", label: street ? '"COURS"' : "Mes Cours", icon: BookOpen, path: "/dashboard/cours" },
    { id: "examens", label: street ? '"EXAMENS"' : "Mes Examens", icon: GraduationCap, path: "/dashboard/examens" },
    { id: "notifications", label: street ? '"NOTIFS"' : "Notifications", icon: Bell, path: "/dashboard/notifications" },
  ];
}

function StudentLayoutContent() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme, setCurrentTheme, themeData } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Nombre de notifications non lues affiché en badge dans la nav
  useEffect(() => {
    getNotifications(token)
      .then((data) => setUnreadCount(data.filter((n) => !n.read).length))
      .catch(() => {});
  }, [token]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  // "/dashboard" ne doit être actif que sur la page exacte, les autres
  // restent actifs sur toutes leurs sous-routes (ex: une leçon d'un cours)
  function isPathActive(path) {
    return path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);
  }

  function handleNavClick(path) {
    setSidebarOpen(false);
    navigate(path);
  }

  const isStreet = currentTheme === "streetwear";

  return (
    <div className="student-layout" data-theme={currentTheme}>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-logo">
            <h2>{isStreet ? "CORELAB" : "Corelab"}</h2>
            <span>{isStreet ? "// INDUSTRIAL LAB" : "Atelier Numérique"}</span>
          </div>

          <nav className="sidebar-nav">
            {menuItems(currentTheme).map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.path);

              return (
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${active ? "active" : ""}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="sidebar-nav-pill"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <Icon size={18} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>

                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="sidebar-nav-badge">{unreadCount}</span>
                  )}
                </button>
              );
            })}

            {/* Onglet Thèmes */}
            <button
              className="sidebar-theme-toggle"
              onClick={() => setThemeMenuOpen((v) => !v)}
            >
              <Palette size={18} />
              <span>{isStreet ? '"THÈMES"' : "Thèmes"}</span>
            </button>

            <AnimatePresence>
              {themeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="theme-menu"
                >
                  <p>Choisir l'univers</p>
                  {Object.values(themes).map((t) => (
                    <button
                      key={t.id}
                      className={`theme-option ${currentTheme === t.id ? "selected" : ""}`}
                      onClick={() => {
                        setCurrentTheme(t.id);
                        setThemeMenuOpen(false);
                      }}
                    >
                      <span>{t.name}</span>
                      {currentTheme === t.id && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="user-info-row">
            <div className="user-avatar">{user?.name?.[0] ?? "E"}</div>
            <div className="user-info-text">
              <span>{user?.name?.split(" ")[0] ?? "Étudiant"}</span>
              <small>{themeData.badge}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="layout-main">
        {isStreet && (
          <div className="street-marquee">
            <div className="street-marquee-track">
              <span>
                CORE-LAB // INDUSTRIAL LEARNING // SEASON 2026 // DO NOT
                CROSS —{" "}
              </span>
              <span>
                CORE-LAB // INDUSTRIAL LEARNING // SEASON 2026 // DO NOT
                CROSS —{" "}
              </span>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

function StudentLayout() {
  return (
    <ThemeProvider>
      <StudentLayoutContent />
    </ThemeProvider>
  );
}

export default StudentLayout;
