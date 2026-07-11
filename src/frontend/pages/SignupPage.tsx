import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../backend/auth";
import { Header } from "../../shared/Header";
import { Button, Field, Input } from "../../shared/ui";

export default function SignupPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least six characters.");
      return;
    }

    setBusy(true);
    const { error: signUpError } = await signUp(email, password);
    setBusy(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    setMessage("Account created. Check your inbox if email confirmation is on, then sign in.");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="page">
      <Header />
      <main className="auth-shell">
        <div className="auth-card card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub muted">Save your analyses and revisit them anytime.</p>

          {!configured ? (
            <div className="notice">
              Accounts are not enabled in this build. Add your Supabase keys to a .env file
              to turn on sign up and saved history. The analyzer works without an account.
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
            <Field label="Password" htmlFor="password" hint="At least six characters.">
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!configured || busy}
              />
            </Field>

            {error ? <div className="notice notice-error">{error}</div> : null}
            {message ? <div className="notice notice-ok">{message}</div> : null}

            <Button type="submit" className="btn-block" disabled={!configured || busy}>
              {busy ? "Creating account" : "Create account"}
            </Button>
          </form>

          <p className="auth-alt muted">
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
