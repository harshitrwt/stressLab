"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// ------------- IMPORTANT FIX -------------
// Load three-globe only on client.
// Prevents “window is not defined”.
let ThreeGlobeClass: any = null;
if (typeof window !== "undefined") {
  ThreeGlobeClass = require("three-globe").default;
}


import * as THREE from "three";
import { Color, Scene, Fog, Vector3 } from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  globeColor?: string;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  pointSize?: number;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  arcLength?: number;
  arcTime?: number;
  rings?: number;
  maxRings?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

// -----------------------------------------------------------
//  INTERNAL R3F GLOBE COMPONENT (VALID <group />)
// -----------------------------------------------------------
function GlobeObject({ globeConfig, data }: WorldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const defaults = {
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    pointSize: 1,
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    arcLength: 0.9,
    arcTime: 2000,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  // INIT GLOBE SAFELY
  useEffect(() => {
    if (!groupRef.current) return;

    const g = new ThreeGlobeClass();
    globeRef.current = g;

    groupRef.current.add(g);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !globeRef.current) return;

    const material = globeRef.current.globeMaterial();
    material.color = new Color(defaults.globeColor);
    material.emissive = new Color(defaults.emissive);
    material.emissiveIntensity = defaults.emissiveIntensity;
    material.shininess = defaults.shininess;
  }, [ready, defaults]);

  // BUILD GEOMETRIES
  useEffect(() => {
    if (!ready || !globeRef.current) return;

    const g = globeRef.current;

    g.hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaults.showAtmosphere)
      .atmosphereColor(defaults.atmosphereColor)
      .atmosphereAltitude(defaults.atmosphereAltitude)
      .hexPolygonColor(() => defaults.polygonColor);

    g.arcsData(data)
      .arcStartLat((d: any) => d.startLat)
      .arcStartLng((d: any) => d.startLng)
      .arcEndLat((d: any) => d.endLat)
      .arcEndLng((d: any) => d.endLng)
      .arcColor((d: any) => d.color)
      .arcAltitude((d: any) => d.arcAlt)
      .arcStroke(() => 0.25)
      .arcDashLength(defaults.arcLength)
      .arcDashInitialGap((d: any) => d.order)
      .arcDashGap(15)
      .arcDashAnimateTime(defaults.arcTime);

    return () => {};
  }, [ready, data, defaults]);

  return <group ref={groupRef} />;
}

// -----------------------------------------------------------
//  PUBLIC WORLD WRAPPER (SAFE FOR PAGE RENDER)
// -----------------------------------------------------------
export function Globe(props: WorldProps) {
  return (
    <Canvas
      camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, cameraZ] }}
    >
      <ambientLight intensity={0.6} color={"#ffffff"} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />

      <GlobeObject {...props} />
    </Canvas>
  );
}
