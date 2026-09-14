import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ShieldCheck, CheckCircle2, Star, Loader2, Lock, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

const AREAS = ["All", "Katy", "Cypress", "Sugar Land", "Pearland", "Alvin", "Spring"];

function StarRow({ rating, size = 14 }) {
  const r = rating || 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(r) ? "fill-ink text-ink" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default function Carpool() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All");
  const [womenOnly, setWomenOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const [requestRow, setRequestRow] = useState(undefined);
  const [sending, setSending] = useState(false);

  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingProfiles(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setFetchError("Couldn't load matches right now. Try refreshing.");
      } else {
        setProfiles(data || []);
      }
      setLoadingProfiles(false);
    })();
  }, [session]);

  useEffect(() => {
    if (!selected || !session) return;
    setRequestRow(undefined);
    (async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("*")
        .or(
          `and(requester_id.eq.${session.user.id},recipient_id.eq.${selected.id}),and(requester_id.eq.${selected.id},recipient_id.eq.${session.user.id})`
        )
        .maybeSingle();
      setRequestRow(data || null);
    })();
  }, [selected, session]);

  async function sendRequest() {
    setSending(true);
    const { data, error } = await supabase
      .from("ride_requests")
      .insert({ requester_id: session.user.id, recipient_id: selected.id })
      .select()
      .single();
    setSending(false);
    if (!error) setRequestRow(data);
  }

  async function submitRating() {
    if (ratingValue === 0) return;
    setSubmittingRating(true);

    const { data: updatedRequest, error: updateError } = await supabase
      .from("ride_requests")
      .update({ completed_at: new Date().toISOString(), rating: ratingValue })
      .eq("id", requestRow.id)
      .select()
      .single();

    if (updateError) {
      setSubmittingRating(false);
      return;
    }

    const { data: allRatings } = await supabase
      .from("ride_requests")
      .select("rating")
      .eq("recipient_id", selected.id)
      .not("rating", "is", null);

    const ratings = (allRatings || []).map((r) => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    await supabase
      .from("profiles")
      .update({ rating: Math.round(avg * 10) / 10, rides: ratings.length })
      .eq("id", selected.id);

    setRequestRow(updatedRequest);
    setSubmittingRating(false);
  }

  const filtered = profiles.filter((m) => {
    const s = search.toLowerCase();
    const matchSearch = !s || m.name.toLowerCase().includes(s) || (m.location || "").toLowerCase().includes(s);
    const matchArea = area === "All" || (m.location || "").includes(area);
    const matchGender = !womenOnly || m.women_only;
    return matchSearch && matchArea && matchGender;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-ink/30" />
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
        <div className="bg-primary py-4">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-white font-bold text-lg text-center">Carpool Matching</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Lock size={28} className="text-ink/20 mx-auto mb-3" />
          <p className="font-bold text-ink mb-1">Sign in to see real matches</p>
          <p className="text-sm text-ink/50 mb-5 max-w-xs mx-auto">
            Carpool profiles are only visible to verified UH students, to keep everyone's info safe.
          </p>
          <Link
            to="/profile"
            className="inline-block px-5 py-3 rounded-md text-white font-bold text-sm"
            style={{ backgroundColor: "#960C22" }}
          >
            Sign in with UH Email
          </Link>
        </div>
      </div>
    );
  }

  if (selected) {
    const iAmRequester = requestRow && requestRow.requester_id === session.user.id;

    return (
      <div className="bg-white min-h-screen">
        <div className="bg-primary py-4">
          <div className="max-w-3xl mx-auto px-4 grid grid-cols-[24px_1fr_24px] items-center">
            <button onClick={() => setSelected(null)} className="text-white">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-white font-bold text-lg text-center">Match Profile</h1>
            <span />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-6 pb-10">
          <div className="bg-cream rounded-lg p-6 mb-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-btn">{selected.name.charAt(0)}</span>
            </div>
            <h2 className="font-bold text-xl text-ink flex items-center justify-center gap-1.5">
              {selected.name} <CheckCircle2 size={16} className="text-primary" />
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <StarRow rating={selected.rating} size={14} />
              <span className="text-xs text-ink/40">
                {selected.rating || "New"} {selected.rides ? `(${selected.rides} rides)` : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/60 text-left">
              <div>
                <p className="text-[10px] text-ink/40 uppercase tracking-wide">Neighborhood</p>
                <p className="text-sm text-ink font-medium mt-0.5">{selected.location}, TX</p>
              </div>
              <div>
                <p className="text-[10px] text-ink/40 uppercase tracking-wide">Schedule</p>
                <p className="text-sm text-ink font-medium mt-0.5">
                  {selected.days} · {selected.arrives}
                </p>
              </div>
            </div>

            {selected.women_only && (
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-ink/60">
                <ShieldCheck size={13} className="text-primary" />
                <span>Women-only rider</span>
              </div>
            )}

            {selected.bio && (
              <p className="mt-5 text-sm text-ink/70 leading-relaxed border-t border-white/60 pt-4">
                "{selected.bio}"
              </p>
            )}
          </div>

          {requestRow === undefined ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin text-ink/30" />
            </div>
          ) : !requestRow ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={sendRequest}
              disabled={sending}
              className="w-full py-4 rounded-md text-white font-bold text-base disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#960C22" }}
            >
              {sending && <Loader2 size={16} className="animate-spin" />}
              {sending ? "Sending…" : "Request a ride"}
            </motion.button>
          ) : requestRow.status === "pending" && iAmRequester ? (
            <div className="w-full py-5 rounded-md bg-yellow-50 border border-yellow-200 text-center">
              <Clock size={22} className="text-yellow-700 mx-auto mb-1" />
              <p className="font-bold text-yellow-800">Request sent — waiting on {selected.name}</p>
            </div>
          ) : requestRow.status === "pending" && !iAmRequester ? (
            <div className="w-full py-5 rounded-md bg-yellow-50 border border-yellow-200 text-center">
              <Clock size={22} className="text-yellow-700 mx-auto mb-1" />
              <p className="font-bold text-yellow-800">{selected.name} wants to ride with you</p>
              <p className="text-xs text-yellow-700 mt-1">Respond from your Profile page.</p>
            </div>
          ) : requestRow.status === "accepted" && requestRow.completed_at ? (
            <div className="w-full py-5 rounded-md bg-green-50 border border-green-200 text-center">
              <CheckCircle2 size={22} className="text-green-700 mx-auto mb-1" />
              <p className="font-bold text-green-800">
                {iAmRequester
                  ? `You rated this ride ${requestRow.rating} star${requestRow.rating > 1 ? "s" : ""}`
                  : "Ride marked complete"}
              </p>
            </div>
          ) : requestRow.status === "accepted" && iAmRequester ? (
            <div className="bg-cream rounded-md p-5">
              <p className="font-bold text-ink text-sm mb-1">Rode with {selected.name}?</p>
              <p className="text-xs text-ink/50 mb-3">Mark it complete and leave a rating.</p>
              <div className="flex gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRatingValue(s)}>
                    <Star
                      size={26}
                      className={s <= ratingValue ? "fill-ink text-ink" : "text-gray-200 fill-gray-200"}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={submitRating}
                disabled={ratingValue === 0 || submittingRating}
                className="w-full py-3 rounded-md text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#960C22" }}
              >
                {submittingRating && <Loader2 size={15} className="animate-spin" />}
                {submittingRating ? "Submitting…" : "Mark complete & rate"}
              </button>
              <p className="text-xs text-ink/40 mt-3 text-center">
                In the meantime, reach out at {selected.email} to coordinate.
              </p>
            </div>
          ) : requestRow.status === "accepted" ? (
            <div className="w-full py-5 rounded-md bg-green-50 border border-green-200 text-center">
              <CheckCircle2 size={22} className="text-green-700 mx-auto mb-1" />
              <p className="font-bold text-green-800">You're connected!</p>
              <p className="text-xs text-green-600 mt-1">Reach out at {selected.email} to coordinate.</p>
            </div>
          ) : (
            <div className="w-full py-5 rounded-md bg-gray-50 border border-gray-200 text-center">
              <p className="font-bold text-ink/60">Request declined</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-primary py-4">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-white font-bold text-lg text-center">Carpool Matching</h1>
        </div>
      </div>

      <div className="sticky top-14 bg-white px-4 pt-4 pb-3 z-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 mb-2.5">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 text-sm bg-transparent outline-none text-ink placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scroll">
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                  area === a ? "bg-btn text-white border-btn" : "bg-white text-ink border-gray-200"
                }`}
              >
                {a}
              </button>
            ))}
            <button
              onClick={() => setWomenOnly(!womenOnly)}
              className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                womenOnly ? "bg-btn text-white border-btn" : "bg-white text-ink border-gray-200"
              }`}
            >
              <ShieldCheck size={12} /> Women-only
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-5 pb-10">
        {loadingProfiles ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-ink/30" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-600">{fetchError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-ink">
              {profiles.length === 0 ? "No carpool profiles yet" : "No matches found"}
            </p>
            <p className="text-sm text-ink/50 mt-1">
              {profiles.length === 0
                ? "Be the first to create one — go to your Profile page."
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(m)}
                className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-btn">{m.name.charAt(0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="font-bold text-sm text-ink">{m.name}</p>
                  <CheckCircle2 size={12} className="text-primary" title="Verified @cougarnet.uh.edu" />
                </div>
                <div className="flex items-center gap-1 mt-0.5 mb-2">
                  <StarRow rating={m.rating} size={11} />
                  <span className="text-[11px] text-ink/40">{m.rating || "New"}</span>
                </div>
                <p className="text-xs text-ink/50">{m.location}, TX</p>
                <p className="text-xs text-ink/50">
                  {m.days} · {m.arrives}
                </p>
                {m.women_only && (
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-ink/50">
                    <ShieldCheck size={11} className="text-primary" />
                    <span>Women-only</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}