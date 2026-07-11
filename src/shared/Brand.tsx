import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="CellDrop home">
      <span className="brand-mark">
        <Droplet size={18} strokeWidth={2.2} />
      </span>
      <span className="brand-word">CellDrop</span>
    </Link>
  );
}
