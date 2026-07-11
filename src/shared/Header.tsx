import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../backend/auth";
import { Brand } from "./Brand";

export function Header() {
  const { user, configured, signOut } = useAuth();
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
            Analyzer
          </NavLink>
          {configured && user ? (
            <NavLink to="/history" className="nav-link">
              History
            </NavLink>
          ) : null}
        </nav>

        <div className="nav-actions">
          {configured && user ? (
            <>
              <span className="nav-email mono" title={user.email ?? ""}>
                {user.email}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : configured ? (
            <>
              <Link to="/login" className="nav-link">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          ) : (
            <Link to="/app" className="btn btn-primary btn-sm">
              Open analyzer
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
