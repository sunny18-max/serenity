import { motion } from 'framer-motion';

export default function MentalHealthAnimationFallback() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10 relative flex items-center justify-center border border-border/20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-8 h-8 border-2 border-primary/20 dark:border-primary/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              borderRadius: i % 2 === 0 ? '50%' : '0%',
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main character */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Head with face */}
        <motion.div
          className="relative w-40 h-40 mb-6"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Head shape */}
          <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-300 dark:to-amber-400 rounded-full shadow-2xl relative overflow-hidden">
            {/* Hair */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-t-full"></div>
            
            {/* Eyes */}
            <div className="absolute top-12 left-8 w-6 h-6 bg-white rounded-full shadow-inner">
              <motion.div 
                className="w-4 h-4 bg-blue-600 rounded-full mt-1 ml-1"
                animate={{
                  x: [0, 2, 0, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
            </div>
            <div className="absolute top-12 right-8 w-6 h-6 bg-white rounded-full shadow-inner">
              <motion.div 
                className="w-4 h-4 bg-blue-600 rounded-full mt-1 ml-1"
                animate={{
                  x: [0, -2, 0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
            </div>
            
            {/* Nose */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-4 bg-amber-300 dark:bg-amber-400 rounded-full shadow-sm"></div>
            
            {/* Mouth */}
            <motion.div 
              className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-rose-500 rounded-b-full"
              animate={{
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            {/* Cheeks */}
            <div className="absolute top-18 left-4 w-4 h-4 bg-rose-300 dark:bg-rose-400 rounded-full opacity-60"></div>
            <div className="absolute top-18 right-4 w-4 h-4 bg-rose-300 dark:bg-rose-400 rounded-full opacity-60"></div>
          </div>
          
          {/* Thought bubbles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-100 rounded-full shadow-lg border-2 border-primary/20"
              animate={{
                scale: [0, 1, 0],
                y: [0, -20, -40],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs">
                {['💭', '✨', '🌟'][i]}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Body */}
        <motion.div
          className="relative w-32 h-48 bg-gradient-to-b from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-t-3xl rounded-b-2xl shadow-xl"
          animate={{
            scaleY: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Heart in chest */}
          <motion.div
            className="absolute top-8 left-1/2 -translate-x-1/2"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
          
          {/* Arms */}
          <motion.div
            className="absolute -left-8 top-4 w-16 h-8 bg-amber-200 dark:bg-amber-300 rounded-full shadow-md"
            animate={{
              rotate: [0, -15, 0, 15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -right-8 top-4 w-16 h-8 bg-amber-200 dark:bg-amber-300 rounded-full shadow-md"
            animate={{
              rotate: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
        </motion.div>

        {/* Legs */}
        <div className="flex gap-4 mt-2">
          <motion.div
            className="w-8 h-20 bg-blue-600 dark:bg-blue-700 rounded-b-full shadow-md"
            animate={{
              scaleY: [1, 0.95, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="w-8 h-20 bg-blue-600 dark:bg-blue-700 rounded-b-full shadow-md"
            animate={{
              scaleY: [1, 0.95, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </div>
      </div>

      {/* Wellness icons floating around */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { icon: '🧠', pos: { left: '10%', top: '20%' } },
          { icon: '💚', pos: { left: '85%', top: '25%' } },
          { icon: '🌱', pos: { left: '15%', top: '70%' } },
          { icon: '⭐', pos: { left: '80%', top: '65%' } },
          { icon: '🎯', pos: { left: '5%', top: '45%' } },
          { icon: '🌟', pos: { left: '90%', top: '45%' } },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-70"
            style={item.pos}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <motion.p
          className="text-lg font-semibold text-primary dark:text-primary-light bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full backdrop-blur-sm"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Your Mental Wellness Journey
        </motion.p>
      </div>
    </div>
  );
}
