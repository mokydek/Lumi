import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../backend/auth";
import { useI18n, LangToggle } from "../frontend/i18n";
import { Brand } from "./Brand";

export function Header() {
  const { user, configured, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Brand />

        <nav className="nav" aria-label="Primary">
          <NavLink to="/app" className="nav-link">
            {t("nav.analyzer")}
          </NavLink>
          {configured && user ? (
            <NavLink to="/history" className="nav-link">
              {t("nav.history")}
            </NavLink>
          ) : null}
        </nav>

        <div className="nav-actions">
          <LangToggle />
          {configured && user ? (
            <>
              <span className="nav-email mono" title={user.email ?? ""}>
                {user.email}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                {t("nav.signout")}
              </button>
            </>
          ) : configured ? (
            <>
              <Link to="/login" className="nav-link">
                {t("nav.signin")}
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                {t("nav.getStarted")}
              </Link>
            </>
          ) : (
            <Link to="/app" className="btn btn-primary btn-sm">
              {t("nav.openAnalyzer")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
