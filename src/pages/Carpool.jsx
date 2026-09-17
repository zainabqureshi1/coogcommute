import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Calendar, Loader2, User } from "lucide-react";
import { supabase } from "../lib/supabase";

const AREAS = ["All", "Katy", "Cypress", "Sugar Land", "Pearland", "Alvin", "Spring"];
const DAYS = ["All", "Mon", "Tue", "Wed", "Thu", "Fri"];

export default function Carpool() {
  const [session, setSession] = useState(undefined);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const [area, setArea] = useState("All");
  const [day, setDay] = useState("All");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingProfiles(true);
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) {
        setProfiles(data);
      }
      setLoadingProfiles(false);
    })();
  }, [session]);

  if (session === undefined) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const userEmail = session?.user?.email || "";
  const isUHEmail =
    userEmail.toLowerCase().endsWith("@uh.edu") ||
    userEmail.toLowerCase().endsWith("@cougarnet.uh.edu");

  if (!session || !isUHEmail) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-primary py-4 text-center">
          <h1 className="text-white font-bold text-lg">Carpool Matching</h1>
        </div>
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center mx-auto mb-3">
            <User size={22} className="text-ink/30" />
          </div>
          <h2 className="font-bold text-ink text-lg mb-1">Sign in to see real matches</h2>
          <p className="text-xs text-ink/50 mb-5">
            Carpool profiles are only visible to verified UH students.
          </p>
          <Link
            to="/profile"
            className="inline-block w-full py-3 rounded-md text-white font-bold text-sm"
            style={{ backgroundColor: "#960C22" }}
          >
            Sign in with UH Email
          </Link>
        </div>
      </div>
    );
  }

  const filtered = profiles.filter((p) => {
    if (p.id === session.user.id) return false;
    if (area !== "All" && p.location !== area) return false;
    if (day !== "All" && p.days && !p.days.includes(day)) return false;
    return true;
  });

  const hasOwnProfile = profiles.some((p) => p.id === session.user.id);

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="bg-primary py-4 text-center">
        <h1 className="text-white font-bold text-lg">Carpool Matching</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
        {!loadingProfiles && !hasOwnProfile && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-ink">
              <span className="font-bold">You haven't made a profile yet.</span>{" "}
              Create one so other students can match with you too.
            </p>
            <Link
              to="/profile"
              className="whitespace-nowrap px-4 py-2 rounded-md text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: "#960C22" }}
            >
              Create profile
            </Link>
          </div>
        )}

        <div className="bg-cream rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
              Filter by Neighborhood
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md bg-white text-sm text-ink outline-none"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
              Filter by Day
            </label>
            <div className="flex gap-1.5 mt-1">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold border transition-colors ${
                    day === d
                      ? "text-white border-transparent"
                      : "bg-white text-ink border-white"
                  }`}
                  style={day === d ? { backgroundColor: "#960C22" } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingProfiles ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-ink/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 bg-cream rounded-lg">
            <p className="text-sm font-semibold text-ink/60">No matches found</p>
            <p className="text-xs text-ink/40 mt-1">Try expanding your search filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cream rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-ink text-base">{p.name}</h3>
                  <span className="text-xs bg-white px-2.5 py-1 rounded-full font-semibold text-ink/70">
                    {p.location}, TX
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink/60">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {p.days}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> Arrives {p.arrives}
                  </span>
                </div>
                {p.bio && <p className="text-xs text-ink/70 pt-1">{p.bio}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}