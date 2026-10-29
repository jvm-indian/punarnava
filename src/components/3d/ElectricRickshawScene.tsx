import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Rotate3d,
  Layers,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const ElectricRickshawScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Floating dock controls state
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [explodedAmount, setExplodedAmount] = useState(0); // 0 to 1
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [hasCargoLoad, setHasCargoLoad] = useState(true);

  // References for render loop
  const rickshawGroupRef = useRef<THREE.Group | null>(null);
  const cargoBayRef = useRef<THREE.Group | null>(null);
  const roofRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const headlampRef = useRef<THREE.PointLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const explodedRef = useRef(0);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    explodedRef.current = explodedAmount;
  }, [explodedAmount]);

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.045);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(4.2, 2.4, 4.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x064e3b, 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x10b981, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Headlight glowing beam
    const headlamp = new THREE.PointLight(0xffeedd, 3, 10);
    headlamp.position.set(0, 0.7, 1.9);
    scene.add(headlamp);
    headlampRef.current = headlamp;

    // Contact Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x10b981, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 5. Procedural 3D Composite Subject: Electric Cargo E-Rickshaw (3-12 distinct parts)
    const rickshaw = new THREE.Group();
    rickshaw.position.y = 0.35; // Flush with ground wheels
    scene.add(rickshaw);
    rickshawGroupRef.current = rickshaw;

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const bodyEmeraldMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.5,
      roughness: 0.2,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });

    const rubberTireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1,
    });

    const yellowTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.3,
    });

    const solarPanelMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Part 1: Main Tubular Chassis Frame
    const frameGeo = new THREE.BoxGeometry(1.2, 0.15, 2.6);
    const frameMesh = new THREE.Mesh(frameGeo, chassisMat);
    frameMesh.position.set(0, 0.2, 0);
    frameMesh.castShadow = !isSoftwareGl;
    rickshaw.add(frameMesh);

    // Part 2: Driver Footboard & Front Cowling
    const floorGeo = new THREE.BoxGeometry(0.9, 0.08, 1.0);
    const floorMesh = new THREE.Mesh(floorGeo, chassisMat);
    floorMesh.position.set(0, 0.3, 0.8);
    rickshaw.add(floorMesh);

    const cowlGeo = new THREE.BoxGeometry(0.85, 0.7, 0.5);
    const cowlMesh = new THREE.Mesh(cowlGeo, bodyEmeraldMat);
    cowlMesh.position.set(0, 0.7, 1.15);
    cowlMesh.castShadow = !isSoftwareGl;
    rickshaw.add(cowlMesh);

    // Front Windshield Glass
    const glassGeo = new THREE.PlaneGeometry(0.75, 0.55);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.05,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 1.25, 1.1);
    glassMesh.rotation.x = -0.2;
    rickshaw.add(glassMesh);

    // Part 3: Driver Saddle & Chrome Handlebars
    const seatGeo = new THREE.BoxGeometry(0.45, 0.15, 0.4);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const seatMesh = new THREE.Mesh(seatGeo, seatMat);
    seatMesh.position.set(0, 0.6, 0.45);
    rickshaw.add(seatMesh);

    const handleStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.65);
    const handleStem = new THREE.Mesh(handleStemGeo, chromeMat);
    handleStem.position.set(0, 0.9, 1.1);
    handleStem.rotation.x = 0.25;
    rickshaw.add(handleStem);

    const handleBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7);
    const handleBar = new THREE.Mesh(handleBarGeo, chromeMat);
    handleBar.position.set(0, 1.15, 1.02);
    handleBar.rotation.z = Math.PI / 2;
    rickshaw.add(handleBar);

    // Part 4: Heavy-Duty Cargo Bay Container
    const cargoGroup = new THREE.Group();
    cargoBayRef.current = cargoGroup;

    const cargoBoxGeo = new THREE.BoxGeometry(1.3, 0.85, 1.5);
    const cargoBoxMesh = new THREE.Mesh(cargoBoxGeo, yellowTrimMat);
    cargoBoxMesh.position.set(0, 0.7, -0.55);
    cargoBoxMesh.castShadow = !isSoftwareGl;
    cargoGroup.add(cargoBoxMesh);

    // Baled Dry Recyclables inside Cargo Box
    const paperBaleGeo = new THREE.BoxGeometry(0.5, 0.35, 0.45);
    const paperBaleMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 });
    const paperBale1 = new THREE.Mesh(paperBaleGeo, paperBaleMat);
    paperBale1.position.set(-0.3, 0.95, -0.6);
    cargoGroup.add(paperBale1);

    const paperBale2 = new THREE.Mesh(paperBaleGeo, paperBaleMat);
    paperBale2.position.set(-0.3, 0.95, -0.2);
    cargoGroup.add(paperBale2);

    // Copper Wire Coil
    const copperTorusGeo = new THREE.TorusGeometry(0.2, 0.08, 12, 24);
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
    const copperCoil = new THREE.Mesh(copperTorusGeo, copperMat);
    copperCoil.position.set(0.3, 0.95, -0.4);
    copperCoil.rotation.x = Math.PI / 2;
    cargoGroup.add(copperCoil);

    rickshaw.add(cargoGroup);

    // Part 5: Aerodynamic Canopy Roof & Solar PV Array
    const roofGroup = new THREE.Group();
    roofRef.current = roofGroup;

    const roofPillarsGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.3);
    const p1 = new THREE.Mesh(roofPillarsGeo, chromeMat);
    p1.position.set(-0.55, 1.3, -1.2);
    const p2 = new THREE.Mesh(roofPillarsGeo, chromeMat);
    p2.position.set(0.55, 1.3, -1.2);
    const p3 = new THREE.Mesh(roofPillarsGeo, chromeMat);
    p3.position.set(-0.4, 1.3, 0.8);
    const p4 = new THREE.Mesh(roofPillarsGeo, chromeMat);
    p4.position.set(0.4, 1.3, 0.8);
    roofGroup.add(p1, p2, p3, p4);

    const canopyGeo = new THREE.BoxGeometry(1.35, 0.08, 2.5);
    const canopyMesh = new THREE.Mesh(canopyGeo, bodyEmeraldMat);
    canopyMesh.position.set(0, 1.95, -0.1);
    roofGroup.add(canopyMesh);

    // Solar Panel on Roof
    const solarGeo = new THREE.BoxGeometry(1.2, 0.03, 2.0);
    const solarMesh = new THREE.Mesh(solarGeo, solarPanelMat);
    solarMesh.position.set(0, 2.0, -0.15);
    roofGroup.add(solarMesh);

    rickshaw.add(roofGroup);

    // Part 6: Spoked Wheels with Rubber Tires (1 Front, 2 Rear)
    const wheelsList: THREE.Group[] = [];

    const createWheel = (x: number, y: number, z: number, isFront = false) => {
      const wheelGrp = new THREE.Group();
      wheelGrp.position.set(x, y, z);

      const tireGeo = new THREE.TorusGeometry(0.32, 0.09, 16, 32);
      const tireMesh = new THREE.Mesh(tireGeo, rubberTireMat);
      tireMesh.rotation.y = Math.PI / 2;
      tireMesh.castShadow = !isSoftwareGl;
      wheelGrp.add(tireMesh);

      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
      const hubMesh = new THREE.Mesh(hubGeo, chromeMat);
      hubMesh.rotation.z = Math.PI / 2;
      wheelGrp.add(hubMesh);

      rickshaw.add(wheelGrp);
      wheelsList.push(wheelGrp);
      return wheelGrp;
    };

    // Front Center Wheel
    createWheel(0, 0, 1.4, true);
    // Rear Left Wheel
    createWheel(-0.68, 0, -0.7);
    // Rear Right Wheel
    createWheel(0.68, 0, -0.7);

    wheelsRef.current = wheelsList;

    // Part 7: LED Headlight Pod & Eco Badge
    const lightPodGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const lightPodMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
    });
    const lightPod = new THREE.Mesh(lightPodGeo, lightPodMat);
    lightPod.position.set(0, 0.72, 1.42);
    rickshaw.add(lightPod);

    // Mouse / Touch Drag Interaction with Damped Camera
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.6;
    let targetRotationX = 0.15;
    let currentRotationY = 0.6;
    let currentRotationX = 0.15;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.2, Math.min(0.6, targetRotationX + deltaY * 0.005));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Animation Loop with Exponential Damping
    let frameId = 0;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Auto rotation if enabled
      if (autoRotateRef.current && !isDragging) {
        targetRotationY += 0.4 * dt;
      }

      // Smooth exponential damping: 1 - Math.exp(-k * dt)
      const dampFactor = 1 - Math.exp(-7 * dt);
      currentRotationY += (targetRotationY - currentRotationY) * dampFactor;
      currentRotationX += (targetRotationX - currentRotationX) * dampFactor;

      rickshaw.rotation.y = currentRotationY;
      rickshaw.rotation.x = currentRotationX;

      // Rotate wheels smoothly as if rolling
      wheelsList.forEach((w) => {
        w.children[0].rotation.x += 1.5 * dt;
      });

      // Handle Exploded View separation damping
      const exp = explodedRef.current;
      if (roofRef.current) {
        roofRef.current.position.y = 0 + exp * 1.2;
      }
      if (cargoBayRef.current) {
        cargoBayRef.current.position.z = 0 - exp * 0.8;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
    };
  }, []);

  // Night Mode Light updates
  useEffect(() => {
    if (keyLightRef.current && headlampRef.current) {
      if (isNightMode) {
        keyLightRef.current.intensity = 0.6;
        headlampRef.current.intensity = 6;
      } else {
        keyLightRef.current.intensity = 2.8;
        headlampRef.current.intensity = 3;
      }
    }
  }, [isNightMode]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl">
      {/* 3D Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Title & Specs Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-extrabold text-xs text-white tracking-wider">
            PUNARNAVA CARGO E-RICKSHAW 3D
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            DL-01-EV-3498
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 ml-1 font-mono">
          Drag to inspect 360° • Composite PBR Simulation
        </p>
      </div>

      {/* Viewport Floating Bottom Control Dock (Follows Three.js Skill Directives: <= 15% footprint, collapsible) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-xl">
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2.5">
          {/* Collapse Header Bar */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Rotate3d className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Model Dock</span>
            </span>

            <button
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isControlsOpen ? 'Collapse Dock' : 'Expand Dock'}
            >
              {isControlsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Content */}
          {isControlsOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80 text-xs">
              {/* Exploded View Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exploded Sub-Parts:</span>
                  </span>
                  <span>{Math.round(explodedAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggles: Auto-Rotate & Lighting */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isAutoRotating
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {isAutoRotating ? 'Auto Orbit: ON' : 'Orbit: Paused'}
                </button>

                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`p-1.5 rounded-xl border text-xs transition-all ${
                    isNightMode
                      ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle Day / Night Studio Lighting"
                >
                  {isNightMode ? <Moon className="w-4 h-4 text-indigo-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
