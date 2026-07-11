import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <Brand />
        <p className="muted footer-note">
          Cell viability counting for the Goryaev chamber. Built for the lab bench.
        </p>
      </div>
    </footer>
  );
}
