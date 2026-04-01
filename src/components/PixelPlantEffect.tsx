import React, { useMemo } from 'react';
import { motion } from 'motion/react';

// Import plant sprite sheets
import succulentSheet from 'figma:asset/e75ffa67de8d722f14baa6c6493d0bf196ff5aa8.png';
import plantSheet from 'figma:asset/94056247942b95cf32087a16533df305f0f99852.png';

interface PixelPlantEffectProps {
  x: number;
  y: number;
}

export default function PixelPlantEffect({ x, y }: PixelPlantEffectProps) {
  // Randomly select a plant type and position within the sprite sheet
  const plantData = useMemo(() => {
    const isSucculent = Math.random() > 0.5;
    
    if (isSucculent) {
      // Succulent sheet has 10 plants in 2 rows of 5
      // Each plant is approximately 200x270 pixels
      const col = Math.floor(Math.random() * 5);
      const row = Math.floor(Math.random() * 2);
      
      return {
        image: succulentSheet,
        backgroundPositionX: `-${col * 200}px`,
        backgroundPositionY: `-${row * 270}px`,
        width: 200,
        height: 270,
      };
    } else {
      // Plant sheet has 8 plants in 2 rows of 4
      // Each plant is approximately 250x250 pixels
      const col = Math.floor(Math.random() * 4);
      const row = Math.floor(Math.random() * 2);
      
      return {
        image: plantSheet,
        backgroundPositionX: `-${col * 250}px`,
        backgroundPositionY: `-${row * 250}px`,
        width: 250,
        height: 250,
      };
    }
  }, []);

  return (
    <>
      {/* Main growing plant */}
      <motion.div
        className="absolute pixelated"
        style={{
          left: x - plantData.width / 4, // Center on explosion point
          top: y - plantData.height / 4,
          width: plantData.width / 2, // Scale down to 50%
          height: plantData.height / 2,
          backgroundImage: `url(${plantData.image})`,
          backgroundPosition: `${plantData.backgroundPositionX} ${plantData.backgroundPositionY}`,
          backgroundSize: `${plantData.width * 5}px ${plantData.height * 2}px`, // Scale entire sheet
          imageRendering: 'pixelated',
        }}
        initial={{ scale: 0, y: 20, opacity: 0 }}
        animate={{
          scale: [0, 0.3, 1.2, 1],
          y: [20, 0, -10, 0],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
          times: [0, 0.3, 0.7, 1],
        }}
      />

      {/* Sparkle particles around the plant */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const distance = 40 + Math.random() * 20;
        
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: x,
              top: y,
              background: 'linear-gradient(135deg, #22c55e, #86efac)',
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.5 + Math.random() * 0.3,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Floating leaf particles */}
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-xl opacity-70"
          style={{
            left: x + (Math.random() - 0.5) * 50,
            top: y + (Math.random() - 0.5) * 50,
          }}
          initial={{ scale: 0, rotate: 0, y: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1, 0],
            rotate: Math.random() * 360,
            y: [-20, -50],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.8 + Math.random() * 0.5,
            ease: "easeOut",
          }}
        >
          🍃
        </motion.div>
      ))}

      {/* Soft glow effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: x - 40,
          top: y - 40,
          width: 80,
          height: 80,
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0) 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 2],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
        }}
      />
    </>
  );
}
