import { Link } from "react-router-dom";
import { useI18n } from "../frontend/i18n";
import { Brand } from "./Brand";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <Brand />
        <p className="muted footer-note">{t("footer.tagline")}</p>
      </div>
      <div className="container footer-legal">
        <p className="muted footer-ruo">{t("footer.ruo")}</p>
        <Link to="/legal" className="link footer-legal-link">
          {t("footer.legalLink")}
        </Link>
      </div>
    </footer>
  );
}
