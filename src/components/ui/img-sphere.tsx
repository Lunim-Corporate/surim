"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export interface ImageData {
  id: string;
  src: string;
  alt: string;
}

export interface SphereImageGridProps {
  images?: ImageData[];
  containerSize?: number; // px
  sphereRadius?: number; // px
  dragSensitivity?: number; // 0.1 - 2.0
  momentumDecay?: number; // 0.8 - 0.99
  maxRotationSpeed?: number; // 1 - 10
  baseImageScale?: number; // 0.05 - 0.3
  perspective?: number; // 500 - 2000
  autoRotate?: boolean;
  autoRotateSpeed?: number; // 0.1 - 2.0
  className?: string;
}

interface RotationState { x: number; y: number; z: number }
interface MousePosition { x: number; y: number }

const deg = (d: number) => d * (Math.PI / 180);

export default function SphereImageGrid({
  images = [],
  containerSize = 520,
  sphereRadius = 180,
  dragSensitivity = 0.6,
  maxRotationSpeed = 6,
  baseImageScale = 0.14,
  perspective = 1000,
  className = "",
}: SphereImageGridProps) {
  const [rotation, setRotation] = useState<RotationState>({ x: 15, y: 15, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [positions, setPositions] = useState<{ theta: number; phi: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef<MousePosition>({ x: 0, y: 0 });
  const lastScrollY = useRef<number>(0);

  // Fibonacci distribution
  useEffect(() => {
    const n = images.length || 1;
    const golden = (1 + Math.sqrt(5)) / 2;
    const inc = (2 * Math.PI) / golden;
    const arr: { theta: number; phi: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const incl = Math.acos(1 - 2 * t);
      const az = inc * i;
      let phi = (incl * 180) / Math.PI;
      const theta = (az * 180) / Math.PI;
      phi = 15 + (phi / 180) * 150; // map to 15..165 for stability
      arr.push({ theta, phi });
    }
    setPositions(arr);
  }, [images.length]);

  const clamp = useCallback((v: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, v)), [maxRotationSpeed]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const rotDelta = { x: -dy * dragSensitivity, y: dx * dragSensitivity };
    setRotation((p) => ({ x: p.x + clamp(rotDelta.x), y: p.y + clamp(rotDelta.y), z: p.z }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragSensitivity, clamp]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      if (!deltaY) return;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setRotation((prev) => ({
            x: prev.x,
            y: prev.y + clamp(deltaY * 0.25),
            z: prev.z,
          }));
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [clamp]);

  const nodes = images.map((img, i) => {
    const { theta, phi } = positions[i] || { theta: 0, phi: 0 };
    const th = deg(theta);
    const ph = deg(phi);
    // base sphere position
    let x = sphereRadius * Math.sin(ph) * Math.cos(th);
    let y = sphereRadius * Math.cos(ph);
    let z = sphereRadius * Math.sin(ph) * Math.sin(th);
    // rotate
    const ry = deg(rotation.y);
    const rx = deg(rotation.x);
    const x1 = x * Math.cos(ry) + z * Math.sin(ry);
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    x = x1; z = z1;
    const y2 = y * Math.cos(rx) - z * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z * Math.cos(rx);
    y = y2; z = z2;

    const depthScale = (z + sphereRadius) / (2 * sphereRadius);
    const scale = 0.8 + depthScale * 0.4;
    const size = 80;
    const visible = z > -30;
    if (!visible) return null;

    return (
      <div
        key={img.id}
        className="absolute will-change-transform select-none"
        style={{
          width: size,
          height: size,
          left: containerSize / 2 + x,
          top: containerSize / 2 + y,
          transform: "translate(-50%, -50%)",
          zIndex: Math.round(1000 + z),
          opacity: 0.9,
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-md border border-white/10">
          <Image src={img.src} alt={img.alt} fill className="object-cover" draggable={false} />
        </div>
      </div>
    );
  });

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: containerSize, height: containerSize, perspective: `${perspective}px` }}
      onMouseDown={onMouseDown}
    >
      <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
        <div className="pointer-events-none absolute inset-0 rounded-full blur-md" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(141,246,255,0.08), rgba(141,246,255,0.04) 45%, transparent 70%)' }} />
        {nodes}
      </div>
    </div>
  );
}
