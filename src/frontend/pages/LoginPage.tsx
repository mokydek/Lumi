import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../backend/auth";
import { Header } from "../../shared/Header";
import { Button, Field, Input } from "../../shared/ui";

export default function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const { error: signInError } = await signIn(email, password);
    setBusy(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="page">
      <Header />
      <main className="auth-shell">
        <div className="auth-card card">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-sub muted">Welcome back. Continue to your analyses.</p>

          {!configured ? (
            <div className="notice">
              Accounts are not enabled in this build. Add your Supabase keys to a .env file
              to turn on sign in and saved history. The analyzer works without an account.
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!configured || busy}
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!configured || busy}
              />
            </Field>

            {error ? <div className="notice notice-error">{error}</div> : null}

            <Button type="submit" className="btn-block" disabled={!configured || busy}>
              {busy ? "Signing in" : "Sign in"}
            </Button>
          </form>

          <p className="auth-alt muted">
            No account yet? <Link to="/signup" className="link">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
