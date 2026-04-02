import React from "react";
import "./PageNotFound.css";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "@tsparticles/slim";
import type { Engine as SlimEngine } from "@tsparticles/engine";
import type { Engine as ParticlesEngine } from "tsparticles-engine";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/lunim-logo.png";

const PageNotFound: React.FC = () => {
  const particlesInit = async (engine: ParticlesEngine) => {
    await loadSlim(engine as unknown as SlimEngine);
  };

  // Create stars for background
  const stars = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    size: Math.random() * 3,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5
  }));

  return (
    <div className="min-h-screen bg-space-gradient overflow-hidden relative font-space-grotesk text-lunar-blue">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 150, density: { enable: true, area: 800 } },
              color: { value: "#a3d9ff" },
              shape: { type: "circle" },
              opacity: { value: 0.5, random: true },
              size: { value: 3, random: true },
              links: {
                enable: true,
                distance: 150,
                color: "#5a9fd4",
                opacity: 0.3,
                width: 1
              },
              move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                outModes: "out",
                bounce: false
              }
            },
            interactivity: {
              detectsOn: "canvas",
              events: {
                onHover: { enable: true, mode: "grab" },
                onClick: { enable: true, mode: "push" },
                resize: true
              },
              modes: {
                grab: { distance: 140, links: { opacity: 1 } },
                push: { quantity: 4 }
              }
            },
            retina_detect: true
          }}
        />
        
        {/* Stars */}
        <div className="absolute inset-0" id="stars">
          {stars.map(star => (
            <div 
              key={star.id}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: star.top,
                left: star.left,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${star.delay}s`,
                opacity: 0.3 + Math.random() * 0.7
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Floating text */}
      <motion.div 
        className="absolute top-[20%] w-full text-center font-orbitron text-lunar-mist text-lg z-10"
        initial={{ x: '-100vw' }}
        animate={{ x: '100vw' }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
      >
        LUNIM - EXPLORING LUNAR MYSTERIES
      </motion.div>
      
      <motion.div 
        className="absolute top-[30%] w-full text-center font-orbitron text-lunar-mist text-lg z-10"
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
      >
        404 - ORBIT NOT FOUND
      </motion.div>
      
      <motion.div 
        className="absolute top-[80%] w-full text-center font-orbitron text-lunar-mist text-lg z-10"
        initial={{ x: '-100vw' }}
        animate={{ x: '100vw' }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
      >
        RETURN TO HOME BASE
      </motion.div>
      
      {/* Satellite */}
      <motion.div 
        className="absolute top-[20%] right-[15%] z-10"
        animate={{ 
          rotate: 360,
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "linear"
        }}
      >
        <svg width="60" height="30" viewBox="0 0 100 50">
          <rect x="10" y="15" width="80" height="20" rx="10" fill="#aaa" />
          <rect x="0" y="20" width="10" height="10" rx="2" fill="#888" />
          <rect x="90" y="20" width="10" height="10" rx="2" fill="#888" />
          <circle cx="30" cy="25" r="8" fill="#555" />
          <circle cx="70" cy="25" r="5" fill="#555" />
          <rect x="40" y="5" width="20" height="40" rx="10" fill="#777" />
        </svg>
      </motion.div>
      
      {/* Astronaut */}
      <motion.div 
        className="absolute bottom-[10%] left-[10%] z-10 w-[100px] h-[150px]"
        animate={{ y: [0, -30, 0] }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop"
        }}
      >
        <svg width="100" height="150" viewBox="0 0 100 150">
          <circle cx="50" cy="45" r="25" fill="#ddd" />
          <circle cx="50" cy="45" r="20" fill="#e0f7ff" />
          <rect x="40" y="40" width="20" height="5" fill="#aaa" />
          <rect x="35" y="70" width="30" height="50" rx="5" fill="#fff" />
          <rect x="25" y="75" width="15" height="40" rx="5" fill="#fff" />
          <rect x="60" y="75" width="15" height="40" rx="5" fill="#fff" />
          <rect x="35" y="120" width="12" height="30" rx="5" fill="#fff" />
          <rect x="53" y="120" width="12" height="30" rx="5" fill="#fff" />
          <circle cx="50" cy="50" r="3" fill="#555" />
          <rect x="45" y="85" width="10" height="20" fill="#555" />
        </svg>
      </motion.div>
      
      {/* Logo */}
      <div className="absolute top-8 left-8 z-50">
        <Image src={logo} alt="lunim logo" className="h-12 w-auto" priority />
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 z-50">
        <div className="relative w-[300px] h-[300px] mb-10 z-40">
          {/* Moon */}
          <motion.div 
            className="absolute inset-0 m-auto w-[200px] h-[200px] rounded-full bg-lunar-surface shadow-lunar-glow"
            animate={{
              boxShadow: [
                "0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(173, 216, 230, 0.3), 0 0 140px rgba(100, 149, 237, 0.2)",
                "0 0 70px rgba(255, 255, 255, 0.6), 0 0 120px rgba(173, 216, 230, 0.5), 0 0 160px rgba(100, 149, 237, 0.3)",
                "0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(173, 216, 230, 0.3), 0 0 140px rgba(100, 149, 237, 0.2)"
              ]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="absolute w-10 h-10 rounded-full bg-crater shadow-inner top-8 left-8" />
            <div className="absolute w-6 h-6 rounded-full bg-crater shadow-inner top-16 right-16" />
            <div className="absolute w-9 h-9 rounded-full bg-crater shadow-inner bottom-16 left-14" />
            <div className="absolute w-5 h-5 rounded-full bg-crater shadow-inner bottom-20 right-20" />
            <div className="absolute w-7 h-7 rounded-full bg-crater shadow-inner top-10 right-20" />
          </motion.div>
          
          {/* Earth */}
          <motion.div 
            className="absolute -bottom-[60px] -right-[40px] w-20 h-20 rounded-full bg-earth shadow-earth-glow"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="absolute w-5 h-2.5 rounded-full bg-cloud opacity-80 top-4 left-4" />
            <div className="absolute w-6 h-3 rounded-full bg-cloud opacity-80 top-8 right-6" />
            <div className="absolute w-5 h-2 rounded-full bg-cloud opacity-80 bottom-6 left-8" />
          </motion.div>
        </div>
        
        <div className="relative z-50">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              delay: 0.3
            }}
            className="text-[8rem] font-orbitron font-bold text-lunar-glow mb-4"
          >
            404
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.5
            }}
            className="text-2xl font-orbitron uppercase tracking-wider mb-6"
          >
            LUNAR MODULE NOT FOUND
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.7
            }}
            className="max-w-2xl text-lg text-lunar-mist mb-10 leading-relaxed"
          >
            Houston, we have a problem. The page you&apos;re trying to reach is not in our orbit. 
            It may have drifted into deep space or been pulled by the moon&apos;s gravity.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.9
            }}
          >
            <Link 
              href="/" 
              className="font-orbitron bg-transparent border-2 border-lunar-blue text-lunar-blue px-8 py-3 rounded-full text-lg uppercase tracking-wider relative overflow-hidden group inline-block"
            >
              <span className="relative z-10">Return to Home Base</span>
              <span className="absolute inset-0 w-full h-full bg-lunar-blue opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
