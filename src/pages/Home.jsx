import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Users, Calculator, Bell } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [alertCount, setAlertCount] = useState(0);

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
      <div className="relative overflow-hidden min-h-[420px] md:min-h-[560px] flex items-end">
        <img
          src="/hero-bg.jpg"
          alt="Traffic on a Houston freeway near UH"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-16 pb-8 md:pb-12"
        >
          <h1
            className="text-white font-extrabold text-4xl md:text-6xl leading-[1.05] max-w-xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
          >
            Commute smarter.
            <br />
            Arrive stress-free.
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-4 max-w-md leading-relaxed">
            Built by a UH student who's driven the Katy Freeway one too many times. Match with Coogs nearby, split gas, and skip the worst of game-day traffic.
          </p>
          <Link
            to="/carpool"
            className="inline-flex items-center gap-1.5 mt-6 bg-primary text-white font-bold text-sm px-5 py-3 rounded-md hover:bg-btn transition-colors"
          >
            Find a ride <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12">
        <span className="inline-block text-xs font-semibold text-ink/50 uppercase tracking-widest px-1 mb-3">
          What do you need?
        </span>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="block group">
              <div className="h-full bg-[#F6F3EE] rounded-lg p-5 md:p-6 flex flex-col justify-between border-b-4 border-transparent group-hover:border-primary transition-colors">
                <div>
                  <div className="w-11 h-11 rounded-md flex items-center justify-center bg-primary/5 border border-primary/10">
                    <f.icon size={20} className="text-primary" />
                  </div>
                  <p className="font-bold text-lg text-ink mt-4">{f.label}</p>
                  <p className="text-sm text-ink/50 mt-1">{f.sub}</p>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  {f.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded border border-primary text-primary">
                      {f.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    View <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}