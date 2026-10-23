import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sliders, Wind, Layers, Eye, EyeOff, Sparkles } from 'lucide-react';

interface Atmosphere3DProps {
  currentAQI?: number;
  className?: string;
  theme?: 'dark' | 'light';
}

export const Atmosphere3D: React.FC<Atmosphere3DProps> = ({ currentAQI = 168, className = '', theme = 'dark' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [particleSpeed, setParticleSpeed] = useState(1.2);
  const [aqiLevel, setAqiLevel] = useState(currentAQI);
  const [explodedView, setExplodedView] = useState(0); // 0 = assembled, 1 = exploded
  const [windAngle, setWindAngle] = useState(45); // degrees
  const isLight = theme === 'light';

  // Mutable refs for animation loop
  const paramsRef = useRef({
    particleSpeed: 1.2,
    aqiLevel: currentAQI,
    explodedView: 0,
    windAngle: 45,
    theme: 'dark',
  });

  useEffect(() => {
    paramsRef.current = {
      particleSpeed,
      aqiLevel,
      explodedView,
      windAngle,
      theme,
    };
  }, [particleSpeed, aqiLevel, explodedView, windAngle, theme]);

  useEffect(() => {
    setAqiLevel(currentAQI);
  }, [currentAQI]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let frameId = 0;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Software-WebGL detection
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    const fogColor = isLight ? '#E2E8F0' : '#0B1220';
    scene.fog = new THREE.FogExp2(fogColor, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5.5, 4.2, 7.5);
    camera.lookAt(0, 1.4, 0);

    // 4. RoomEnvironment with PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio PBR Lighting Rig
    const keyLight = new THREE.DirectionalLight('#FDE68A', 2.8);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 4;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(isLight ? '#38BDF8' : '#38BDF8', isLight ? '#F1F5F9' : '#0F172A', 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#22D3EE', 1.5);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // 6. Ground & Contact Shadow
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLight ? '#CBD5E1' : '#0B1220',
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Procedural radial contact shadow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // 7. COMPOSITE 10-PART PROCEDURAL MONITORING STATION (THREE.Group)
    const stationGroup = new THREE.Group();
    scene.add(stationGroup);

    // Part 1: Octagonal concrete foundation footing
    const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.25, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.85,
      metalness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.125;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    stationGroup.add(baseMesh);

    // Part 2: Brushed aluminum mast shaft
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.4, 16);
    const mastMat = new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      roughness: 0.25,
      metalness: 0.85,
    });
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    mastMesh.position.y = 1.45;
    mastMesh.castShadow = !isSoftwareGl;
    stationGroup.add(mastMesh);

    // Part 3: Structural lattice truss rings
    const ringGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.35,
      metalness: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.8;
    stationGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.position.y = 1.7;
    stationGroup.add(ring2);

    // Part 4: Optical Particle Chamber (PM2.5 laser counter)
    const chamberGroup = new THREE.Group();
    chamberGroup.position.set(0, 2.1, 0);

    const chamberGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.2,
      metalness: 0.8,
    });
    const chamberMesh = new THREE.Mesh(chamberGeo, chamberMat);
    chamberGroup.add(chamberMesh);

    // Part 5: Beveled brass intake collar
    const collarGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 24);
    const collarMat = new THREE.MeshStandardMaterial({
      color: '#F59E0B',
      roughness: 0.2,
      metalness: 0.9,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    chamberGroup.add(collarMesh);
    stationGroup.add(chamberGroup);

    // Part 6: Photovoltaic solar array panel with tilt strut
    const solarGroup = new THREE.Group();
    solarGroup.position.set(0.45, 1.8, 0);
    solarGroup.rotation.z = -0.4;

    const panelGeo = new THREE.BoxGeometry(0.65, 0.03, 0.45);
    const panelMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.15,
      metalness: 0.95,
    });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    solarGroup.add(panelMesh);

    const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const strutMesh = new THREE.Mesh(strutGeo, mastMat);
    strutMesh.position.set(-0.25, -0.15, 0);
    solarGroup.add(strutMesh);
    stationGroup.add(solarGroup);

    // Part 7: Radiation shield louvers (stack of 4 toroids)
    const louverGroup = new THREE.Group();
    louverGroup.position.set(0, 2.5, 0);
    const louverGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.04, 16);
    const louverMat = new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.4,
      metalness: 0.1,
    });
    for (let i = 0; i < 4; i++) {
      const louver = new THREE.Mesh(louverGeo, louverMat);
      louver.position.y = i * 0.07;
      louverGroup.add(louver);
    }
    stationGroup.add(louverGroup);

    // Part 8: Spinning 3-Cup Ultrasonic Anemometer
    const anemometerGroup = new THREE.Group();
    anemometerGroup.position.set(0, 2.9, 0);

    const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    const hubMesh = new THREE.Mesh(hubGeo, mastMat);
    anemometerGroup.add(hubMesh);

    const cupMat = new THREE.MeshStandardMaterial({
      color: '#22D3EE',
      roughness: 0.3,
      metalness: 0.6,
    });

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8);
      const arm = new THREE.Mesh(armGeo, mastMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = angle;
      arm.position.set(Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15);

      const cupGeo = new THREE.SphereGeometry(0.06, 12, 12, 0, Math.PI);
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      cup.rotation.y = angle + Math.PI / 2;
      anemometerGroup.add(arm);
      anemometerGroup.add(cup);
    }
    stationGroup.add(anemometerGroup);

    // Part 9: High-Gain RF / IoT Antenna & Status Optic
    const antennaGeo = new THREE.ConeGeometry(0.015, 0.6, 8);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.1,
      metalness: 0.95,
    });
    const antennaMesh = new THREE.Mesh(antennaGeo, antennaMat);
    antennaMesh.position.set(0, 3.25, 0);
    stationGroup.add(antennaMesh);

    const statusLensGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const statusLensMat = new THREE.MeshStandardMaterial({
      color: '#22D3EE',
      emissive: '#22D3EE',
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const statusLens = new THREE.Mesh(statusLensGeo, statusLensMat);
    statusLens.position.set(0, 2.38, 0.35);
    stationGroup.add(statusLens);

    // 8. INSTANCED AIRBORNE PARTICULATE DISPERSION FIELD (PM2.5 & PM10 aerosols)
    const particleCount = isSoftwareGl ? 120 : 380;
    const particleGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    instancedParticles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedParticles);

    // Initial random particle positions and velocities
    const particleData: Array<{ x: number; y: number; z: number; speed: number; radius: number; phase: number }> = [];
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 3.6;
      const phase = Math.random() * Math.PI * 2;
      const y = 0.2 + Math.random() * 3.8;
      const speed = 0.4 + Math.random() * 0.8;
      particleData.push({ x: Math.cos(phase) * radius, y, z: Math.sin(phase) * radius, speed, radius, phase });

      dummy.position.set(Math.cos(phase) * radius, y, Math.sin(phase) * radius);
      const scale = 0.4 + Math.random() * 1.2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;

    // Helper color interpolation based on AQI
    function getParticleColor(aqi: number): THREE.Color {
      if (aqi <= 50) return tempColor.set('#22C55E'); // Good
      if (aqi <= 100) return tempColor.set('#84CC16'); // Satisfactory
      if (aqi <= 200) return tempColor.set('#EAB308'); // Moderate
      if (aqi <= 300) return tempColor.set('#F97316'); // Poor
      if (aqi <= 400) return tempColor.set('#EF4444'); // Very Poor
      return tempColor.set('#991B1B'); // Severe
    }

    // 9. Interactive mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.35;
    let targetRotationX = 0.15;
    let currentRotationY = 0.35;
    let currentRotationX = 0.15;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.006;
      targetRotationX = Math.max(-0.2, Math.min(0.6, targetRotationX + deltaY * 0.004));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation Loop with frame-rate independent smooth damping
    const clock = new THREE.Clock();
    let currentExploded = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const params = paramsRef.current;

      // Exponential damping on camera / station orbit
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 6, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 6, delta);

      stationGroup.rotation.y = currentRotationY;
      stationGroup.rotation.x = currentRotationX;

      // Rotate anemometer cups
      anemometerGroup.rotation.y += delta * (params.particleSpeed * 4.5);

      // Handle exploded view separation
      currentExploded = THREE.MathUtils.damp(currentExploded, params.explodedView, 5, delta);
      chamberGroup.position.y = 2.1 + currentExploded * 0.7;
      solarGroup.position.x = 0.45 + currentExploded * 0.8;
      louverGroup.position.y = 2.5 + currentExploded * 1.3;
      anemometerGroup.position.y = 2.9 + currentExploded * 1.9;
      antennaMesh.position.y = 3.25 + currentExploded * 2.5;

      // Update particle colors based on AQI
      const pColor = getParticleColor(params.aqiLevel);
      statusLensMat.color.copy(pColor);
      statusLensMat.emissive.copy(pColor);

      // Update particle circulation
      const windRad = (params.windAngle * Math.PI) / 180;
      const windVecX = Math.cos(windRad) * 0.02 * params.particleSpeed;
      const windVecZ = Math.sin(windRad) * 0.02 * params.particleSpeed;

      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        p.phase += delta * params.particleSpeed * 0.8;
        p.x = Math.cos(p.phase) * p.radius + Math.sin(p.phase * 0.5) * 0.3;
        p.z = Math.sin(p.phase) * p.radius;
        p.y = ((p.y + delta * 0.2 * params.particleSpeed) % 4.2);

        // Wind drift offset
        dummy.position.set(p.x + windVecX * i * 0.05, p.y, p.z + windVecZ * i * 0.05);
        const s = 0.6 + Math.sin(p.phase) * 0.3;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        instancedParticles.setMatrixAt(i, dummy.matrix);
        instancedParticles.setColorAt(i, pColor);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;
      if (instancedParticles.instanceColor) instancedParticles.instanceColor.needsUpdate = true;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden border transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-300/80 shadow-lg'
          : 'bg-[#0B1220] border-slate-800/80 shadow-2xl'
      } ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Title & Telemetry Spec (Zero-Pill Anti-Slop) */}
      <div className="absolute top-4 left-5 pointer-events-none select-none z-10">
        <div className={`flex items-center gap-2 text-xs font-semibold tracking-wider ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>3D ATMOSPHERIC SIMULATOR</span>
        </div>
        <h3 className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          IoT Monitoring Mast & Dispersion Dynamics
        </h3>
        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Drag to orbit 360° · Real-time fluid particulate stream
        </p>
      </div>

      {/* Viewport Collapsible Bottom Dock (Consolidated Ergonomic Controls) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl z-20 transition-all duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-34px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium border rounded-t-lg transition-colors cursor-pointer ${
              isLight
                ? 'bg-white text-slate-700 border-slate-300 hover:text-slate-950 shadow-sm'
                : 'bg-[#111C2E] text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            {isCollapsed ? (
              <Eye className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isCollapsed ? 'Show Simulator Controls' : 'Collapse Controls'}</span>
          </button>
        </div>

        {/* Solid Control Panel Surface */}
        <div
          className={`border rounded-xl p-3.5 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs transition-colors ${
            isLight
              ? 'bg-white border-slate-300/90 text-slate-800'
              : 'bg-[#111C2E] border-slate-700/80 text-white'
          }`}
        >
          {/* Control 1: Particle Flow Speed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-medium">
              <span className={`flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Wind className={`w-3 h-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                <span>Flow Velocity</span>
              </span>
              <span className={`font-mono-nums ${isLight ? 'text-cyan-700 font-bold' : 'text-cyan-300'}`}>
                {particleSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={particleSpeed}
              onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
              className={`accent-cyan-500 cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
            />
          </div>

          {/* Control 2: AQI Simulation Level */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-medium">
              <span className={`flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Sliders className={`w-3 h-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                <span>AQI Intensity</span>
              </span>
              <span className={`font-mono-nums ${isLight ? 'text-amber-700 font-bold' : 'text-amber-400'}`}>
                {aqiLevel}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="450"
              step="5"
              value={aqiLevel}
              onChange={(e) => setAqiLevel(parseInt(e.target.value))}
              className={`accent-amber-500 cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
            />
          </div>

          {/* Control 3: Wind Vector Heading */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-medium">
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Wind Angle</span>
              <span className={`font-mono-nums ${isLight ? 'text-teal-700 font-bold' : 'text-teal-300'}`}>
                {windAngle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={windAngle}
              onChange={(e) => setWindAngle(parseInt(e.target.value))}
              className={`accent-teal-500 cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
            />
          </div>

          {/* Control 4: Exploded Component Assembly View */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-medium">
              <span className={`flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Layers className={`w-3 h-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                <span>CAD Explode</span>
              </span>
              <span className={`font-mono-nums ${isLight ? 'text-slate-900 font-bold' : 'text-slate-300'}`}>
                {Math.round(explodedView * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedView}
              onChange={(e) => setExplodedView(parseFloat(e.target.value))}
              className={`accent-cyan-500 cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
