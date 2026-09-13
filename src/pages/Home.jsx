import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Users, Calculator, Bell } from "lucide-react";
import { supabase } from "../lib/supabase";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Home() {
  const [alertCount, setAlertCount] = useState(0);

  // Real count from your campus_events table — not the old hardcoded array
  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("campus_events")
        .select("*", { count: "exact", head: true });
      setAlertCount(count || 0);
    })();
  }, []);

  const features = [
    {
      to: "/carpool",
      icon: Users,
      label: "Carpool Matching",
      sub: "Find Coogs from your neighborhood",
    },
    {
      to: "/alerts",
      icon: Bell,
      label: "Campus Alerts",
      sub: "Game days, closures & disruptions",
      badge: alertCount > 0 ? alertCount : null,
    },
    {
      to: "/calculator",
      icon: Calculator,
      label: "Gas Calculator",
      sub: "See exactly how much you'd save",
    },
  ];

  return (
        <div className="bg-white min-h-screen flex flex-col">
      {/* ── Hero — solid red, no photo ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #CC0000 0%, #7A0000 100%)" }}>
        {/* Decorative circles */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.13, 0.07] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white pointer-events-none"
        />

        {/* Hero text */}
<div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-8 md:pt-10 md:pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="text-white font-extrabold text-3xl md:text-5xl leading-tight mb-2 md:max-w-2xl"
          >
            Commute smarter.<br />Arrive stress-free.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/80 text-sm italic font-medium"
          >
            A commuter companion for UH students.
          </motion.p>
        </div>
      </div>

      {/* ── Everything below the hero — UH garage photo as full-bleed background ──
          Drop your image at public/hero-bg.jpg — same file the hero used to show,
          just moved down here per your wireframe. Adjust opacity-50 to taste. */}
            <div className="relative overflow-hidden flex-1">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="UH Campus"
            className="w-full h-full object-cover opacity-50"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-5 md:py-10 space-y-3">
          <span className="inline-block text-xs font-semibold text-ink/70 uppercase tracking-widest px-2 py-1 rounded bg-white/70 backdrop-blur-sm">
            What do you need?
          </span>

          <motion.div variants={stagger} initial="hidden" animate="show"
            className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {features.map((f) => (
              <motion.div key={f.to} variants={fadeUp} className="md:h-full">
                <Link to={f.to} className="block h-full">
                  <div className="bg-[#F6F3EE] border border-gray-100 rounded-lg px-4 py-4 md:p-6 flex items-center md:flex-col md:items-start md:text-left gap-4 md:gap-0 hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-md flex items-center justify-center flex-shrink-0 md:mb-4 bg-primary/5 border border-primary/10">
                      <f.icon size={20} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] md:text-lg text-ink">{f.label}</p>
                      <p className="text-xs md:text-sm text-ink/50 mt-0.5">{f.sub}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 md:mt-4">
                      {f.badge && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded border border-primary text-primary">
                          {f.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-ink/25" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}