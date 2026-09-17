import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ChevronRight, Loader2, AlertCircle, LogOut, Check, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const UH_DOMAINS = ["@cougarnet.uh.edu", "@uh.edu"];
const AREAS = ["Katy", "Cypress", "Sugar Land", "Pearland", "Alvin", "Spring"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function Profile() {
  const [session, setSession] = useState(undefined);
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [myProfile, setMyProfile] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", location: AREAS[0], customLocation: "", days: [], arrives: "", bio: "", women_only: false });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [incoming, setIncoming] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setMyProfile(session === null ? null : undefined);
      return;
    }
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);
        setMyProfile(null);
        return;
      }
      setMyProfile(data);
      if (data) {
        const savedLocation = data.location || AREAS[0];
        const isKnownArea = AREAS.includes(savedLocation);
        setForm({
          name: data.name || "",
          location: isKnownArea ? savedLocation : "Other",
          customLocation: isKnownArea ? "" : savedLocation,
          days: data.days ? data.days.split("/") : [],
          arrives: data.arrives || "",
          bio: data.bio || "",
          women_only: !!data.women_only,
        });
      }
    })();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingRequests(true);
      const { data: requests } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("recipient_id", session.user.id)
        .eq("status", "pending");

      if (!requests || requests.length === 0) {
        setIncoming([]);
        setLoadingRequests(false);
        return;
      }

      const requesterIds = requests.map((r) => r.requester_id);
      const { data: requesterProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", requesterIds);

      const combined = requests.map((r) => ({
        ...r,
        requester: (requesterProfiles || []).find((p) => p.id === r.requester_id),
      }));
      setIncoming(combined);
      setLoadingRequests(false);
    })();
  }, [session]);

  async function respondToRequest(requestId, status) {
    setRespondingTo(requestId);
    const { error } = await supabase
      .from("ride_requests")
      .update({ status })
      .eq("id", requestId);
    setRespondingTo(null);
    if (!error) setIncoming((prev) => prev.filter((r) => r.id !== requestId));
  }

  async function sendLink() {
    setError("");
    const trimmed = email.trim().toLowerCase();

    const isValidDomain = UH_DOMAINS.some((domain) => trimmed.endsWith(domain));
    if (!isValidDomain) {
      setError(`Please use your UH email (must end in @uh.edu or @cougarnet.uh.edu).`);
      return;
    }

    setLoading(true);

    const redirectUrl = window.location.origin + window.location.pathname;

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });
    setLoading(false);

    if (sendError) {
      setError(sendError.message);
      return;
    }
    setStep("sent");
  }

  async function verifyCode() {
    setVerifyError("");
    const trimmedCode = otp.trim();
    if (!trimmedCode) {
      setVerifyError("Enter the code from your email.");
      return;
    }

    setVerifying(true);
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: trimmedCode,
      type: "email",
    });
    setVerifying(false);

    if (verifyErr) {
      setVerifyError(verifyErr.message);
      return;
    }
    // onAuthStateChange will pick up the new session automatically.
    setOtp("");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStep("email");
    setEmail("");
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }

  async function saveProfile() {
    setSaveError("");
    if (!form.name.trim() || form.days.length === 0 || !form.arrives.trim()) {
      setSaveError("Please fill in your name, at least one day, and your arrival time.");
      return;
    }
    if (form.location === "Other" && !form.customLocation.trim()) {
      setSaveError("Please type in your neighborhood.");
      return;
    }

    const finalLocation = form.location === "Other" ? form.customLocation.trim() : form.location;

    setSaving(true);
    const { data, error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        email: session.user.email,
        name: form.name.trim(),
        location: finalLocation,
        days: form.days.join("/"),
        arrives: form.arrives.trim(),
        bio: form.bio.trim(),
        women_only: form.women_only,
      })
      .select()
      .single();
    setSaving(false);

    if (upsertError) {
      setSaveError(upsertError.message);
      return;
    }
    setMyProfile(data);
    setEditing(false);
  }

  const browseLinks = [
    { to: "/alerts", label: "View campus alerts" },
    { to: "/calculator", label: "Gas split calculator" },
    { to: "/about", label: "About CoogCommute" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-primary py-4">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-white font-bold text-lg text-center">My Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10 space-y-4">
        {session === undefined && (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-ink/30" />
          </div>
        )}

        {session && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              <User size={26} className="text-btn" />
            </div>
            <h2 className="font-bold text-ink text-lg mb-1">Signed in</h2>
            <p className="text-sm text-ink/60 mb-5">{session.user.email}</p>
            <button onClick={signOut}
              className="w-full py-3 rounded-md border border-ink/15 text-ink font-semibold flex items-center justify-center gap-2">
              <LogOut size={15} /> Sign out
            </button>
          </motion.div>
        )}

        {session && myProfile === undefined && (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-ink/30" />
          </div>
        )}

        {session && myProfile !== undefined && (!myProfile || editing) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-5 space-y-3">
            <h2 className="font-bold text-ink text-base">
              {myProfile ? "Edit your carpool profile" : "Create your carpool profile"}
            </h2>
            <p className="text-xs text-ink/50">
              This is what other students see when they browse carpool matches.
            </p>

            <div>
              <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="First name or nickname"
                className="w-full mt-1.5 px-3 py-2.5 rounded-md bg-white border border-white text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Neighborhood</label>
              <select value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2.5 rounded-md bg-white border border-white text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20">
                {AREAS.map((a) => <option key={a} value={a}>{a}, TX</option>)}
                <option value="Other">Other (type your own)</option>
              </select>
              {form.location === "Other" && (
                <input
                  value={form.customLocation}
                  onChange={(e) => setForm((f) => ({ ...f, customLocation: e.target.value }))}
                  placeholder="e.g. Missouri City, Humble, League City"
                  className="w-full mt-1.5 px-3 py-2.5 rounded-md bg-white border border-white text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Days you commute</label>
              <div className="flex gap-1.5 mt-1.5">
                {DAYS.map((d) => (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={`flex-1 py-2 rounded-md text-xs font-bold border transition-colors ${
                      form.days.includes(d) ? "text-white border-transparent" : "bg-white text-ink border-white"
                    }`}
                    style={form.days.includes(d) ? { backgroundColor: "#960C22" } : {}}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Usual arrival time</label>
              <input value={form.arrives} onChange={(e) => setForm((f) => ({ ...f, arrives: e.target.value }))}
                placeholder="e.g. 9:00 AM"
                className="w-full mt-1.5 px-3 py-2.5 rounded-md bg-white border border-white text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Short bio (optional)</label>
              <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="A line about your schedule, major, or vibe"
                rows={2}
                className="w-full mt-1.5 px-3 py-2.5 rounded-md bg-white border border-white text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={form.women_only}
                onChange={(e) => setForm((f) => ({ ...f, women_only: e.target.checked }))}
                className="w-4 h-4 accent-btn" />
              Only match me with women riders
            </label>

            {saveError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-3 py-2.5 text-xs text-red-700">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {myProfile && (
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-md border border-ink/15 text-ink font-semibold text-sm">
                  Cancel
                </button>
              )}
              <button onClick={saveProfile} disabled={saving}
                className="flex-1 py-3 rounded-md text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#960C22" }}>
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </motion.div>
        )}

        {session && myProfile && !editing && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink text-base flex items-center gap-1.5">
                <Check size={16} className="text-green-700" /> Your carpool profile is live
              </h2>
              <button onClick={() => setEditing(true)} className="text-xs font-semibold text-btn underline">
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-ink/40 uppercase tracking-wide">Neighborhood</p>
                <p className="text-ink font-medium">{myProfile.location}, TX</p>
              </div>
              <div>
                <p className="text-[10px] text-ink/40 uppercase tracking-wide">Schedule</p>
                <p className="text-ink font-medium">{myProfile.days} · {myProfile.arrives}</p>
              </div>
            </div>
          </motion.div>
        )}

        {session && incoming.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-5">
            <h2 className="font-bold text-ink text-base mb-1">Ride requests</h2>
            <p className="text-xs text-ink/50 mb-4">
              {incoming.length} student{incoming.length > 1 ? "s want" : " wants"} to ride with you.
            </p>
            <div className="space-y-3">
              {incoming.map((r) => (
                <div key={r.id} className="bg-white rounded-md p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-ink truncate">{r.requester?.name || "A student"}</p>
                    <p className="text-xs text-ink/50">
                      {r.requester?.location}, TX · {r.requester?.days} · {r.requester?.arrives}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => respondToRequest(r.id, "declined")} disabled={respondingTo === r.id}
                      className="w-8 h-8 rounded-md border border-ink/15 flex items-center justify-center text-ink/50 disabled:opacity-40">
                      <X size={15} />
                    </button>
                    <button onClick={() => respondToRequest(r.id, "accepted")} disabled={respondingTo === r.id}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white disabled:opacity-40"
                      style={{ backgroundColor: "#960C22" }}>
                      {respondingTo === r.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {session === null && step === "email" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              <User size={26} className="text-ink/30" />
            </div>
            <h2 className="font-bold text-ink text-lg mb-1">Sign in to carpool</h2>
            <p className="text-sm text-ink/60 leading-relaxed mb-5">
              Use your UH email to access carpool matching and connect with verified classmates.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@uh.edu or @cougarnet.uh.edu"
              className="w-full px-4 py-3 rounded-md bg-white border border-white text-sm text-ink placeholder-ink/40 outline-none focus:ring-2 focus:ring-primary/20 mb-3"
            />

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-3 py-2.5 text-xs text-red-700 mb-3 text-left">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button onClick={sendLink} disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-md text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#960C22" }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Sending link…" : "Sign in with UH Email"}
            </button>
            <p className="text-xs text-ink/40 mt-3">@uh.edu or @cougarnet.uh.edu required</p>
          </motion.div>
        )}

        {session === null && step === "sent" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-lg p-6 text-center">
            <h2 className="font-bold text-ink text-lg mb-1">Check your email</h2>
            <p className="text-sm text-ink/60 leading-relaxed mb-5">
              We sent a code to <span className="font-semibold">{email}</span>.
              Enter it below to sign in. <strong>Check your junk/spam folder</strong> if you
              don't see it in your inbox within a minute or two.
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="12345678"
              maxLength={8}
              className="w-full px-4 py-3 rounded-md bg-white border border-white text-center tracking-[0.4em] text-lg font-bold text-ink placeholder-ink/30 outline-none focus:ring-2 focus:ring-primary/20 mb-3"
            />

            {verifyError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-3 py-2.5 text-xs text-red-700 mb-3 text-left">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{verifyError}</span>
              </div>
            )}

            <button onClick={verifyCode} disabled={verifying || !otp.trim()}
              className="w-full py-3.5 rounded-md text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2 mb-3"
              style={{ backgroundColor: "#960C22" }}>
              {verifying && <Loader2 size={16} className="animate-spin" />}
              {verifying ? "Verifying…" : "Verify code"}
            </button>

            <button onClick={() => { setStep("email"); setError(""); setOtp(""); setVerifyError(""); }}
              className="text-xs text-ink/40 underline">
              Use a different email
            </button>
          </motion.div>
        )}

        <div className="bg-cream rounded-lg p-4">
          <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-3">Browse without signing in</p>
          {browseLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="flex items-center justify-between py-3 border-b border-white last:border-0">
              <span className="text-sm font-medium text-ink">{l.label}</span>
              <ChevronRight size={15} className="text-ink/30" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}