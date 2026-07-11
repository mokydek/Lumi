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
import { ChamberIllustration } from "./ChamberIllustration";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    body: "Hold your phone to the eyepiece or upload a photo from a digital microscope.",
  },
  {
    icon: ScanLine,
    title: "Detect",
    body: "The engine locates the Goryaev grid and lets you confirm the region to count.",
  },
  {
    icon: Droplet,
    title: "Classify",
    body: "Transparent cells read as live. Cells stained blue by Trypan Blue read as dead.",
  },
  {
    icon: Calculator,
    title: "Compute",
    body: "Viability and concentration appear at once, with your dilution factor applied.",
  },
];

export default function LandingPage() {
  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Cell viability, automated</span>
              <h1 className="hero-title">
                Count live and dead cells in one second, not fifteen minutes
              </h1>
              <p className="hero-sub">
                CellDrop reads a photo of your Goryaev chamber, separates live from dead
                by Trypan Blue, and returns viability and concentration instantly. You
                stay in control with a manual correction layer built for the lab.
              </p>
              <div className="hero-actions">
                <Link to="/app" className="btn btn-primary">
                  Open analyzer
                  <ArrowRight size={16} />
                </Link>
                <a href="#how" className="btn btn-ghost">
                  See how it works
                </a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value mono">10x</span>
                  <span className="hero-stat-label">faster than a clicker</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value mono">~1s</span>
                  <span className="hero-stat-label">per sample</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value mono">100%</span>
                  <span className="hero-stat-label">editable by hand</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <ChamberIllustration />
            </div>
          </div>
        </section>

        <section className="section" id="problem">
          <div className="container section-narrow">
            <span className="eyebrow">The problem</span>
            <h2 className="section-title">
              Manual counting is slow and it strains the eyes
            </h2>
            <p className="section-body">
              Every day scientists grow cells for drug development, cancer research, and
              IVF. To track growth they recount by hand at the microscope, spinning the
              focus with one hand and holding a mechanical clicker in the other, calling
              out live and dead. Then they punch a formula into a calculator. It takes ten
              to fifteen minutes per sample and errors creep in with fatigue.
            </p>
          </div>
        </section>

        <section className="section section-alt" id="how">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2 className="section-title">From photo to result in four steps</h2>
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
              <span className="eyebrow">The math, transparent</span>
              <h2 className="section-title">Exactly the numbers your protocol expects</h2>
            </div>
            <div className="formula-grid">
              <div className="formula-card">
                <div className="formula-head">
                  <Gauge size={18} />
                  <span>Viability</span>
                </div>
                <p className="formula mono">live / (live + dead) x 100</p>
                <p className="formula-note">
                  The share of transparent cells across everything counted.
                </p>
              </div>
              <div className="formula-card">
                <div className="formula-head">
                  <Zap size={18} />
                  <span>Concentration</span>
                </div>
                <p className="formula mono">
                  cells per square x dilution x 10^4
                </p>
                <p className="formula-note">
                  One large square holds 0.1 microliter, which is where the 10^4 factor
                  comes from. You set the dilution and how many squares you counted.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container trust">
            <div className="trust-icon">
              <MousePointerClick size={22} strokeWidth={1.9} />
            </div>
            <h2 className="section-title">Trust comes from control</h2>
            <p className="section-body">
              Computer vision is never perfect, so CellDrop never asks you to accept a
              black box. Every marker can be added, removed, or reclassified with a click.
              The counts and the math update the moment you touch the overlay.
            </p>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-inner">
            <h2 className="cta-title">Bring your next count down to one second</h2>
            <Link to="/app" className="btn btn-primary">
              Open analyzer
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
