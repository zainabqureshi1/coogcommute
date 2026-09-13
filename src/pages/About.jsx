import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-[#fcfbfa] min-h-screen antialiased selection:bg-red-100 selection:text-red-900">
      {/* Sleeker Hero Section */}
      <div className="bg-primary pt-16 pb-28 md:pt-20 md:pb-36 relative overflow-hidden">
        {/* Subtle decorative background glow for modern polish */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />
        
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3"
          >
            About CoogCommute
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-white/80 text-base md:text-lg max-w-xl mx-auto font-medium"
          >
            Built for Coogs, by a Coog. 
          </motion.p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 relative z-20">
        {/* Polished Photo Container (Stops feeling like a misplaced widget) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="-mt-16 md:-mt-24 mb-12 relative"
        >
          <div className="absolute inset-0 bg-slate-900/5 rounded-2xl blur-xl transform translate-y-2 scale-[0.98]" />
          <div className="bg-white p-2 rounded-2xl shadow-xl ring-1 ring-black/5">
            <img
              src="/about-photo.jpg"
              alt="Founder of CoogCommute on the UH campus"
              className="w-full aspect-[16/10] object-cover rounded-xl"
            />
          </div>
        </motion.div>

        {/* Beautiful, Readable Typography Block */}
        <div className="space-y-6 text-[16px] md:text-[17px] leading-relaxed text-slate-700 pb-24">
          <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
            I commuted from Katy to UH for four years. Even on the Katy
            Freeway, the widest highway in the US at 26 lanes, I still
            couldn't reliably make it to my 8am lectures on time. I looked
            into METRO a few times, but driving to a park and ride, waiting on
            a delayed bus, then transferring to a train just to get to campus
            took even longer. And as a woman traveling alone, there were
            plenty of times I didn't feel safe on the train or downtown. So I
            kept driving, by myself, for two more years.
          </p>
          
          <p>
            After I graduated with my CS degree, I decided to build the thing
            I wished existed back then.
          </p>

          <p>
            The average American commute is about 27 minutes each way. For
            Houstonians, 90 minutes each way at peak traffic is the norm. Houston
            is the 4th largest city in the US, and UH is the 3rd largest
            university in Texas. But 85% of UH students commute instead of
            living on or near campus, which means thousands of us merging
            onto the same highways at the same time, in a city that's also
            ranked #1 in the US for road rage.
          </p>

          <p>
            Before writing any code, I sent a survey to UH student orgs and
            interviewed commuters directly. The picture was clear: 75% drive
            to campus alone, and over 80% have a one way commute of 30 to 60+
            minutes. Traffic, long commutes, and gas were the biggest
            frustrations by far.
          </p>

          <p>
            About 68% had never carpooled to campus, and the top reason
            wasn't a bad experience, it was that they didn't know anyone
            nearby to ride with. When I asked what would actually make
            someone comfortable carpooling with another student, the top
            answers were a verified UH email, mutual friends, and being able
            to message before agreeing to ride.
          </p>

          {/* Upgraded Stats Section (Clean Minimalist Cards instead of standard text) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-200/80 py-8 my-8">
            {[
              { n: "28", l: "students surveyed" },
              { n: "86%", l: "said traffic was their top frustration" },
              { n: "68%", l: "had never carpooled" },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-center sm:text-left">
                <p className="font-extrabold text-3xl text-primary tracking-tight">{s.n}</p>
                <p className="text-xs font-medium text-slate-500 leading-snug mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <p>
            CoogCommute is built around what students actually told me they
            needed: UH verified carpool matching, a women-only option for
            anyone who wants it, a gas split calculator, and real alerts
            about what's happening around campus and parking. This is a
            first version, and I'm building on it as I get feedback from
            students actually using it.
          </p>

          <div className="pt-12 border-t border-slate-100 text-center">
            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Made by a 2026 UH CS Alum · Houston, TX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
