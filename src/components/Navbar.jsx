import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/carpool", label: "Carpool Matching" },
    { to: "/calculator", label: "Gas Calculator" },
    { to: "/alerts", label: "Campus Alerts" },
    { to: "/about", label: "About" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-100 z-50 sticky top-0 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Hamburger — mobile only */}
          <button 
            onClick={() => setOpen(true)} 
            className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors md:hidden"
          >
            <Menu size={21} className="text-slate-700" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <svg width="17" height="21" viewBox="0 0 18 22" fill="none" className="transition-transform group-hover:scale-105">
              <path d="M9 0C4.029 0 0 4.029 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.971-4.029-9-9-9z" fill="#CC0000"/>
              <circle cx="9" cy="9" r="3.5" fill="white"/>
            </svg>
            <span className="font-bold text-[17px] tracking-tight" style={{ color: "#CC0000" }}>
              CoogCommute
            </span>
          </Link>

          {/* Horizontal Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 h-full">
            {links.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link 
                  key={l.to} 
                  to={l.to}
                  className={`relative px-3 h-14 flex items-center text-sm font-medium transition-colors ${
                    isActive ? "text-[#CC0000]" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                  {/* Premium animated bottom border for active link */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavBorder"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#CC0000]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Profile Button */}
          <Link to="/profile" className="p-1 group">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 transition-colors group-hover:bg-slate-200/50">
              <User size={15} className="text-slate-600" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Side Nav */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-xs"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-full w-[75vw] md:w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <svg width="15" height="18" viewBox="0 0 18 22" fill="none">
                    <path d="M9 0C4.029 0 0 4.029 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.971-4.029-9-9-9z" fill="#CC0000"/>
                    <circle cx="9" cy="9" r="3.5" fill="white"/>
                  </svg>
                  <span className="font-bold text-[15px]" style={{ color: "#CC0000" }}>CoogCommute</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-50">
                  <X size={19} className="text-slate-500" />
                </button>
              </div>

              <nav className="flex-1 py-3 overflow-y-auto">
                {links.map((l) => {
                  const isActive = location.pathname === l.to;
                  return (
                    <Link 
                      key={l.to} 
                      to={l.to} 
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-6 py-3.5 text-[15px] font-medium transition-colors ${
                        isActive
                          ? "bg-red-50/50 border-r-[3px] border-r-[#CC0000] text-[#CC0000]"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                  Built for Coogs, by a Coog 🐾
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
