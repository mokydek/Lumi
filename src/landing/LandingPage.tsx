import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  ScanLine,
  Droplet,
  Calculator,
  Zap,
  MousePointerClick,
  Gauge,
} from "lucide-react";
import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";
import { useI18n } from "../frontend/i18n";
import { ChamberIllustration } from "./ChamberIllustration";

export default function LandingPage() {
  const { t } = useI18n();

  const steps = [
    { icon: Camera, title: t("how.capture.title"), body: t("how.capture.body") },
    { icon: ScanLine, title: t("how.detect.title"), body: t("how.detect.body") },
    { icon: Droplet, title: t("how.classify.title"), body: t("how.classify.body") },
    { icon: Calculator, title: t("how.compute.title"), body: t("how.compute.body") },
  ];

  const diffs = [
    { title: t("diff.t1.title"), body: t("diff.t1.body") },
    { title: t("diff.t2.title"), body: t("diff.t2.body") },
    { title: t("diff.t3.title"), body: t("diff.t3.body") },
    { title: t("diff.t4.title"), body: t("diff.t4.body") },
    { title: t("diff.t5.title"), body: t("diff.t5.body") },
    { title: t("diff.t6.title"), body: t("diff.t6.body") },
  ];

  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">{t("hero.eyebrow")}</span>
              <h1 className="hero-title">{t("hero.title")}</h1>
              <p className="hero-sub">{t("hero.sub")}</p>
              <div className="hero-actions">
                <Link to="/app" className="btn btn-primary">
                  {t("hero.primary")}
                  <ArrowRight size={16} />
                </Link>
                <a href="#how" className="btn btn-ghost">
                  {t("hero.seeHow")}
                </a>
              </div>

              <p className="hero-trust">{t("hero.trust")}</p>

              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value mono">10x</span>
                  <span className="hero-stat-label">{t("hero.stat1")}</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value mono">~1s</span>
                  <span className="hero-stat-label">{t("hero.stat2")}</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value mono">100%</span>
                  <span className="hero-stat-label">{t("hero.stat3")}</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <ChamberIllustration />
            </div>
          </div>
        </section>

        <section className="section section-alt" id="why">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t("diff.heading")}</span>
              <p className="diff-intro">{t("diff.intro")}</p>
            </div>
            <div className="diff-grid">
              {diffs.map((d, index) => (
                <div className="diff-tile" key={d.title}>
                  <span className="diff-index mono">0{index + 1}</span>
                  <h3 className="diff-title">{d.title}</h3>
                  <p className="diff-body">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="problem">
          <div className="container section-narrow">
            <span className="eyebrow">{t("problem.eyebrow")}</span>
            <h2 className="section-title">{t("problem.title")}</h2>
            <p className="section-body">{t("problem.body")}</p>
          </div>
        </section>

        <section className="section section-alt" id="how">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t("how.eyebrow")}</span>
              <h2 className="section-title">{t("how.title")}</h2>
            </div>
            <div className="steps">
              {steps.map((step, index) => (
                <div className="step" key={step.title}>
                  <div className="step-top">
                    <span className="step-index mono">0{index + 1}</span>
                    <span className="step-icon">
                      <step.icon size={20} strokeWidth={1.9} />
                    </span>
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="math">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t("math.eyebrow")}</span>
              <h2 className="section-title">{t("math.title")}</h2>
            </div>
            <div className="formula-grid">
              <div className="formula-card">
                <div className="formula-head">
                  <Gauge size={18} />
                  <span>{t("math.viability")}</span>
                </div>
                <p className="formula mono">{t("math.viabilityFormula")}</p>
                <p className="formula-note">{t("math.viabilityNote")}</p>
              </div>
              <div className="formula-card">
                <div className="formula-head">
                  <Zap size={18} />
                  <span>{t("math.concentration")}</span>
                </div>
                <p className="formula mono">{t("math.concentrationFormula")}</p>
                <p className="formula-note">{t("math.concentrationNote")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container trust">
            <div className="trust-icon">
              <MousePointerClick size={22} strokeWidth={1.9} />
            </div>
            <h2 className="section-title">{t("trust.title")}</h2>
            <p className="section-body">{t("trust.body")}</p>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-inner">
            <h2 className="cta-title">{t("cta.title")}</h2>
            <Link to="/app" className="btn btn-primary">
              {t("nav.openAnalyzer")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
