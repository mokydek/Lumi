// A static, monochrome illustration of a Goryaev grid with detected cells.
// Green rings mark live cells, blue dots mark dead cells. No gradients.

const live = [
  [70, 64],
  [150, 96],
  [232, 70],
  [104, 176],
  [206, 190],
  [286, 128],
  [132, 250],
  [250, 262],
  [64, 286],
];

const dead = [
  [190, 130],
  [96, 118],
  [270, 220],
  [160, 200],
];

export function ChamberIllustration() {
  const lines = [];
  for (let i = 1; i < 8; i++) {
    const p = 24 + i * 38;
    lines.push(
      <line key={`v${i}`} x1={p} y1={24} x2={p} y2={328} className="ci-grid" />
    );
    lines.push(
      <line key={`h${i}`} x1={24} y1={p} x2={328} y2={p} className="ci-grid" />
    );
  }

  return (
    <svg
      className="chamber-illustration"
      viewBox="0 0 352 352"
      role="img"
      aria-label="Goryaev grid with detected live and dead cells"
    >
      <rect x={24} y={24} width={304} height={304} className="ci-frame" />
      {lines}
      {dead.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r={9} className="ci-dead" />
      ))}
      {live.map(([x, y], i) => (
        <circle key={`l${i}`} cx={x} cy={y} r={10} className="ci-live" />
      ))}
    </svg>
  );
}
