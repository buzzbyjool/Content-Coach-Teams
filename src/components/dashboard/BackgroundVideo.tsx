import { motion } from 'framer-motion';

const FloatingShape = ({ delay = 0 }) => (
  <motion.div
    className="absolute rounded-full mix-blend-overlay"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export function BackgroundVideo() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#5DB6BB] via-[#4A9296] to-[#3A7276]"
    >
      {/* Animated shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#5DB6BB]/20 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#5DB6BB]/20 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl" />

      {/* Floating shapes */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <FloatingShape key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]" 
        style={{ backgroundSize: '24px 24px' }} 
      />

      {/* Bottom wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-white/5"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{
          duration: 1,
          ease: "easeOut"
        }}
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black)"
        }}
      >
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ d: "M0,320L1440,320L1440,320L0,320Z" }}
            animate={{
              d: "M0,320L48,288C96,256,192,192,288,181.3C384,171,480,213,576,234.7C672,256,768,256,864,234.7C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}