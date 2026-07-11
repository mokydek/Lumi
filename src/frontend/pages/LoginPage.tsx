import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../backend/auth";
import { Header } from "../../shared/Header";
import { Button, Field, Input } from "../../shared/ui";
import { useI18n } from "../i18n";

export default function LoginPage() {
  const { signIn, configured } = useAuth();
  const { t } = useI18n();
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
          <h1 className="auth-title">{t("auth.signinTitle")}</h1>
          <p className="auth-sub muted">{t("auth.signinSub")}</p>

          {!configured ? <div className="notice">{t("auth.notConfigured")}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Field label={t("auth.email")} htmlFor="email">
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
            <Field label={t("auth.password")} htmlFor="password">
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
              {busy ? t("auth.signingIn") : t("auth.signin")}
            </Button>
          </form>

          <p className="auth-alt muted">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="link">
              {t("auth.createOne")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
