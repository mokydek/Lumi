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
    </footer>
  );
}
