import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../backend/auth";
import { Header } from "../../shared/Header";
import { Button, Field, Input } from "../../shared/ui";
import { useI18n } from "../i18n";

export default function SignupPage() {
  const { signUp, configured } = useAuth();
  const { t } = useI18n();
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
      setError(t("auth.pwTooShort"));
      return;
    }

    setBusy(true);
    const { error: signUpError } = await signUp(email, password);
    setBusy(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    setMessage(t("auth.created"));
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="page">
      <Header />
      <main className="auth-shell">
        <div className="auth-card card">
          <h1 className="auth-title">{t("auth.signupTitle")}</h1>
          <p className="auth-sub muted">{t("auth.signupSub")}</p>

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
            <Field label={t("auth.password")} htmlFor="password" hint={t("auth.passwordHint")}>
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
              {busy ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </form>

          <p className="auth-alt muted">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="link">
              {t("auth.signin")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
