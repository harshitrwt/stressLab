"use client";

import { motion } from "framer-motion";
import URLForm from "./components/URLForm";
import dynamic from "next/dynamic";


const Globe = dynamic(() => import("@/components/ui/globe").then(m => m.Globe), {
  ssr: false,
});


export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white font-inter">


      <div className="absolute inset-0 z-10 flex items-center justify-center ">
        <Globe globeConfig={{}} data={[]} />
      </div>

 
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(255,215,100,0.12),transparent_70%)]" />

      <div
        className="
          absolute inset-0 -z-40
          bg-[linear-gradient(#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)]
          bg-size:48px_48px
        "
      />

    
      <NetworkBackground />

      
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 text-center">
        
        
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold
                     bg-linear-to-r from-yellow-300 to-yellow-500 
                     bg-clip-text text-transparent"
        >
          High-Performance Network Stress Testing
        </motion.h1>

    
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Validate infrastructure resilience, uncover bottlenecks, and simulate real-world load 
          with precision tools built for engineers who care about performance.
        </motion.p>

   
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-12 mx-auto w-full max-w-lg bg-[#0c0c0c]/70 border border-yellow-600/20 
                     backdrop-blur-xl p-7  shadow-[0_0_25px_rgba(255,200,50,0.10)]"
        >
          <URLForm />
        </motion.div>

   
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-sm text-gray-500 uppercase tracking-widest"
        >
          Designed for SRE • DevOps • Backend Engineers
        </motion.div>
      </div>
    </main>
  );
}


function NetworkBackground() {
  const dots = Array.from({ length: 22 });

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-yellow-400/70"
          initial={{
            x: Math.random() * 1400 - 700,
            y: Math.random() * 800 - 400,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: Math.random() * 1400 - 700,
            y: Math.random() * 800 - 400,
            opacity: [0.3, 1, 0.3],
            scale: [0.6, 1.15, 0.6],
          }}
          transition={{
            duration: 5 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
