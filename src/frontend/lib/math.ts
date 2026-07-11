// Domain math for the Goryaev chamber (hemocytometer).
//
// Viability percent = live / (live + dead) x 100
//
// Concentration (cells per mL) = average cells per large square
//                                x dilution factor
//                                x 10^4
// The 10^4 comes from the counting volume of one large square:
// 1 mm x 1 mm x 0.1 mm depth = 0.1 mm^3 = 10^-4 mL.

export interface CountInput {
  live: number;
  dead: number;
  dilutionFactor: number;
  squaresCounted: number;
}

export interface CountResult {
  total: number;
  viability: number; // percent, 0 to 100
  avgPerSquare: number;
  concentration: number; // total cells per mL
  liveConcentration: number; // live cells per mL
}

const CHAMBER_FACTOR = 1e4;

export function computeResults(input: CountInput): CountResult {
  const total = input.live + input.dead;
  const viability = total > 0 ? (input.live / total) * 100 : 0;

  const squares = Math.max(1, input.squaresCounted);
  const dilution = Math.max(1, input.dilutionFactor);

  const avgPerSquare = total / squares;
  const concentration = avgPerSquare * dilution * CHAMBER_FACTOR;
  const liveConcentration = (input.live / squares) * dilution * CHAMBER_FACTOR;

  return { total, viability, avgPerSquare, concentration, liveConcentration };
}

// Format a large number in scientific notation, for example 2.53 x 10^6.
export function formatScientific(value: number): { mantissa: string; exponent: number } {
  if (value <= 0) return { mantissa: "0.00", exponent: 0 };
  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / Math.pow(10, exponent);
  return { mantissa: mantissa.toFixed(2), exponent };
}
