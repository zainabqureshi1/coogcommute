import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, AlertCircle } from "lucide-react";

// Average TX regular-unleaded price — update this periodically, or replace
// with a live fetch from a gas-price API (e.g. EIA Open Data, free API key
// required: https://www.eia.gov/opendata/) if you want it to auto-update.
const AVG_GAS_PRICE_PER_GALLON = 2.95;
const AVG_MPG = 28;

// University of Houston, Central Campus
const UH_LAT = 29.7199;
const UH_LNG = -95.3422;

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius, miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Free geocoder (OpenStreetMap Nominatim) — no API key needed. Rate-limited
// to ~1 req/sec, which is fine for a personal-scale app. If this ever needs
// to handle real traffic, proxy it through a backend and swap in
// Mapbox/Google's Distance Matrix API for actual driving distance/time
// instead of straight-line distance.
async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    `${place}, TX`
  )}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();
  if (!data.length) throw new Error("not_found");
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function Calculator() {
  const [from, setFrom] = useState("");
  const [riders, setRiders] = useState(2);
  const [result, setResult] = useState(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { lat, lng } = await geocode(from);
      const miles = haversineMiles(UH_LAT, UH_LNG, lat, lng);

      // Straight-line distance from a place way outside the Houston area
      // (e.g. "New York") isn't a real commute — flag it instead of
      // quietly making up a number.
      if (miles > 120) {
        setError(
          `That's about ${Math.round(miles)} miles from UH. Try a Houston-area city or zip code.`
        );
        setLoading(false);
        return;
      }

      const roundTrip = miles * 2;
      const fuel = (roundTrip / AVG_MPG) * AVG_GAS_PRICE_PER_GALLON;
      const toll = miles > 25 ? 3.5 : 1.5;
      const total = fuel + toll;
      const per = total / riders;
      const saved = total - per;

      setResult({
        label: from.trim(),
        miles: Math.round(miles),
        fuel: fuel.toFixed(2),
        toll: toll.toFixed(2),
        total: total.toFixed(2),
        per: per.toFixed(2),
        saved: saved.toFixed(2),
      });
    } catch (e) {
      setError("Couldn't find that location. Try a city, zip code, or street address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-primary py-4">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-white font-bold text-lg text-center">Gas Split Calculator</h1>
        </div>
      </div>

  <div className="max-w-3xl mx-auto px-4 pt-4 pb-10 space-y-4">
        {/* Subtitle */}
        <p className="text-sm font-semibold" style={{ color: "#CC0000" }}>See how much you've saved.</p>

        {/* Result card — cream bg, 3 dark circles, exactly like Figma */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-cream rounded-lg p-5">
              {/* Route label */}
              <p className="font-bold text-ink text-base text-center mb-4">
                {result.label} → UH
              </p>

              {/* 3 dark red circles */}
              <div className="flex justify-center gap-3 mb-5">
                {[
                  { val: result.miles, label: "Miles traveled" },
                  { val: `$${result.fuel}`, label: "Fuel cost" },
                  { val: riders, label: "Riders" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5">
                    <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#960C22" }}>
                      <span className="text-white font-bold text-sm leading-tight text-center px-1">{s.val}</span>
                    </div>
                    <p className="text-[10px] text-ink/60 text-center leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 border-t border-white/60 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70">Cost per rider:</span>
                  <span className="font-bold text-ink">${result.per}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70">Your savings:</span>
                  <span className="font-extrabold text-ink text-base">${result.saved}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input card */}
        <div className="bg-cream rounded-lg p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">From</label>
            <input value={from} onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g. Katy, Cypress, Sugar Land..."
              className="w-full mt-1.5 px-4 py-2.5 rounded-md bg-white border border-white text-sm text-ink placeholder-ink/40 outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">To</label>
            <div className="mt-1.5 px-4 py-2.5 rounded-md bg-white/60 text-sm text-ink/50">
              University of Houston, Houston TX
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide"># of riders</label>
            <div className="flex gap-2 mt-1.5">
              {[2, 3, 4].map((n) => (
                <button key={n} onClick={() => setRiders(n)}
                  className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${
                    riders === n ? "text-white" : "bg-white text-ink"
                  }`}
                  style={riders === n ? { backgroundColor: "#960C22" } : {}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button onClick={calculate} disabled={!from.trim() || loading}
            className="w-full py-3 rounded-md text-white font-bold disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: "#960C22" }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Looking up distance…" : "Calculate"}
          </button>
          <p className="text-[11px] text-ink/35 text-center leading-relaxed">
            Distance is straight-line, not driving distance, and gas price is a Texas average. Actual cost may vary a bit.
          </p>
        </div>

        {/* Rate your driver card */}
        <div className="bg-cream rounded-lg p-5">
          <h2 className="font-bold text-ink text-base text-center mb-1">Rate your driver</h2>
          <p className="text-xs text-ink/50 text-center mb-4">After a ride, let the community know.</p>

          <div className="flex justify-center gap-2 mb-4">
            {[1,2,3,4,5].map((s) => (
              <button key={s} onClick={() => setRating(s)}>
                <Star size={30} className={s <= rating ? "fill-ink text-ink" : "text-gray-300 fill-gray-300"} />
              </button>
            ))}
          </div>

          {!submitted ? (
            <button onClick={() => rating > 0 && setSubmitted(true)} disabled={rating === 0}
              className="w-full py-3 rounded-md text-white font-bold disabled:opacity-40"
              style={{ backgroundColor: "#960C22" }}>
              Submit
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <p className="text-xl">⭐</p>
              <p className="font-bold text-ink text-sm mt-1">Thanks! Rating submitted.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
