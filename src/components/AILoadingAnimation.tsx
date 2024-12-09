import { motion } from 'framer-motion';

export function AILoadingAnimation() {
  return (
    <div className="relative w-16 h-16">
      {/* Pulsing circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-4 border-teal-500"
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 1.5,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Neural network nodes */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* Nodes */}
        {[
          [20, 20],
          [80, 20],
          [50, 50],
          [20, 80],
          [80, 80],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="4"
            fill="currentColor"
            className="text-teal-500"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Connecting lines */}
        {[
          "M20,20 L50,50",
          "M80,20 L50,50",
          "M20,80 L50,50",
          "M80,80 L50,50",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="currentColor"
            className="text-teal-300"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.svg>

      {/* Central processing circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-tr from-teal-500 to-teal-300"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}