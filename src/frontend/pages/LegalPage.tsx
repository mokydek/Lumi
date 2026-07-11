import { Header } from "../../shared/Header";
import { Footer } from "../../shared/Footer";
import { useI18n } from "../i18n";

export default function LegalPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <Header />
      <main className="app-main container">
        <div className="legal">
          <span className="eyebrow">CellDrop</span>
          <h1 className="app-title">{t("legal.title")}</h1>
          <p className="legal-body">{t("legal.body")}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
