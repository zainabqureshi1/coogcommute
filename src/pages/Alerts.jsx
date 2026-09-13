import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, MapPin, Calendar, Megaphone, ShieldAlert, Bell, Phone, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Alerts() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const { data, error: fetchError } = await supabase
        .from("campus_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (fetchError) {
        setError("Couldn't load campus events right now.");
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    })();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Maps event titles to premium, minimalist functional icons
  function getEventContext(title = "") {
    const lower = title.toLowerCase();
    
    // Traffic / Game Day announcements
    if (lower.includes("football") || lower.includes("volleyball") || lower.includes("basketball") || lower.includes("vs")) {
      return { icon: Megaphone, color: "text-red-700 bg-red-50 border-red-100" };
    }
    // High-priority parking & logistics adjustments
    if (lower.includes("parking") || lower.includes("garage")) {
      return { icon: ShieldAlert, color: "text-red-700 bg-red-50 border-red-100" };
    }
    // Standard administrative info updates
    return { icon: Bell, color: "text-slate-600 bg-slate-100 border-slate-200" };
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased">
      {/* Universal Branded Header */}
      <div className="bg-red-700 shadow-md py-5">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-white font-extrabold text-xl tracking-tight text-center">Campus Alerts</h1>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Active Notices Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Active Notices</h2>
              <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                {events.length}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100 p-6">
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                <Info size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm">No alerts right now</p>
                <p className="text-xs text-slate-400 mt-0.5">Check back later for UH-specific updates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((e, i) => {
                  const context = getEventContext(e.title);
                  const ContextIcon = context.icon;

                  return (
                    <motion.div 
                      key={e.id} 
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-[#f6f3ee] rounded-xl p-5 border border-slate-200/60 border-l-4 border-l-red-600 shadow-sm hover:shadow-md transition-all flex gap-4 items-start"
                    >
                      {/* Responsive Vector Wrapper Box */}
                      <div className={`p-3 rounded-xl flex-shrink-0 border ${context.color}`}>
                        <ContextIcon className="w-5 h-5" />
                      </div>

                      {/* Primary Text Block */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {e.title}
                          </h3>
                          {e.event_date && (
                            <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/80 inline-flex items-center gap-1.5 flex-shrink-0 shadow-xs">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {formatDate(e.event_date)}
                            </span>
                          )}
                        </div>
                        {e.body && <p className="text-sm text-slate-600 leading-relaxed font-medium">{e.body}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Control Sidebar Panel */}
          <div className="space-y-6 lg:sticky lg:top-6">
            
            {/* Parking Status Widget */}
            <div className="bg-[#f6f3ee] rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/40 pb-3">
                <MapPin className="w-4 h-4 text-red-600" /> Key Parking Status
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-lg flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Stadium Garage</p>
                    <p className="text-xs text-slate-500">Closest to TDECU Stadium</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200">High Risk</span>
                </div>
                <div className="p-3.5 bg-white rounded-lg flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Elgin Street Garage</p>
                    <p className="text-xs text-slate-500">Alternative event routing</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">Normal</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Balance-Filling Widget */}
            <div className="bg-[#f6f3ee] rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/40 pb-3">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Assistance & Info
              </h3>
              <div className="space-y-2">
                <a 
                  href="tel:7137431097" 
                  className="w-full flex items-center justify-between p-3 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> UH Parking Services
                  </span>
                  <span className="text-slate-400 font-normal">(713) 743-1097</span>
                </a>
                <a 
                  href="https://uh.edu" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Official Parking Site
                  </span>
                  <span className="text-slate-400">→</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
