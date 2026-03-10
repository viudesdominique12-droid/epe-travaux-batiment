/* ========================================
   Hero 3D — Interactive Paint Roller
   Three.js scene with real-time painting
   ======================================== */

import * as THREE from 'three';

/* ---------- Constants ---------- */
const FRUSTUM_SIZE = 10;
const EASING = 0.07;
const MIN_PAINT_DIST = 0.04;

const SPLAT_COLORS = [
  '#1A8A9E', '#1A8A9E',   // vivid teal (Splatoon-saturated)
  '#E86B35', '#E86B35',   // vivid coral-orange
  '#D4A017',              // vivid gold
  '#25B0CC',              // bright cyan
  '#F0944D',              // warm orange
];

/* ---------- Color helpers ---------- */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xFF) + Math.round(2.55 * percent));
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0xFF) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0xFF) - Math.round(2.55 * percent));
  return `rgb(${r},${g},${b})`;
}

/* ---------- Procedural bump texture ---------- */
function createBumpTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 3000; i++) {
    const v = Math.random() * 60 + 98;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(
      Math.random() * size,
      Math.random() * size,
      Math.random() * 3 + 1,
      Math.random() * 3 + 1
    );
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

/* ---------- Roller model ---------- */
function createRoller(segments) {
  const group = new THREE.Group();

  // Roller cylinder
  const rollerGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.7, segments, 1);
  const rollerMat = new THREE.MeshStandardMaterial({
    color: 0xD4845A,
    roughness: 0.92,
    metalness: 0.0,
    bumpMap: createBumpTexture(),
    bumpScale: 0.015,
  });
  const rollerMesh = new THREE.Mesh(rollerGeo, rollerMat);
  rollerMesh.rotation.z = Math.PI / 2;
  rollerMesh.name = 'cylinder';
  group.add(rollerMesh);

  // Roller end caps (slight insets)
  const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, segments);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xb06840,
    roughness: 0.8,
    metalness: 0.1,
  });
  const capL = new THREE.Mesh(capGeo, capMat);
  capL.rotation.z = Math.PI / 2;
  capL.position.x = -0.87;
  group.add(capL);
  const capR = capL.clone();
  capR.position.x = 0.87;
  group.add(capR);

  // Bracket (metal arm) — curve from roller to handle
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Right side bracket arm
  const bracketCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.9, 0, 0),
    new THREE.Vector3(1.05, -0.15, 0),
    new THREE.Vector3(1.05, -0.45, -0.1),
    new THREE.Vector3(0.95, -0.65, -0.35),
  ]);
  const bracketGeo = new THREE.TubeGeometry(bracketCurve, 16, 0.028, 8, false);
  const bracket = new THREE.Mesh(bracketGeo, metalMat);
  group.add(bracket);

  // Left side bracket arm
  const bracketCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, 0, 0),
    new THREE.Vector3(-1.05, -0.15, 0),
    new THREE.Vector3(-1.05, -0.45, -0.1),
    new THREE.Vector3(-0.95, -0.65, -0.35),
  ]);
  const bracketGeoL = new THREE.TubeGeometry(bracketCurveL, 16, 0.028, 8, false);
  const bracketL = new THREE.Mesh(bracketGeoL, metalMat);
  group.add(bracketL);

  // Crossbar connecting both bracket arms
  const crossbarGeo = new THREE.CylinderGeometry(0.028, 0.028, 1.9, 8);
  const crossbar = new THREE.Mesh(crossbarGeo, metalMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, -0.65, -0.35);
  group.add(crossbar);

  // Handle
  const handleGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.6, 12);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x2E5A6E,
    roughness: 0.65,
    metalness: 0.1,
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0, -0.65, -1.2);
  handle.rotation.x = Math.PI / 2;
  group.add(handle);

  // Handle grip end (rubber cap)
  const gripGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.25, 12);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1E3E4E,
    roughness: 0.9,
    metalness: 0.0,
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.set(0, -0.65, -2.05);
  grip.rotation.x = Math.PI / 2;
  group.add(grip);

  // Position the whole group
  group.rotation.x = -0.2;
  group.rotation.y = 0.12;
  group.position.z = 2.5;

  return group;
}

/* ---------- Paint surface ---------- */
function createPaintSurface(aspect, isMobile) {
  const w = isMobile ? 1024 : 2048;
  const h = isMobile ? 512 : 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const geo = new THREE.PlaneGeometry(FRUSTUM_SIZE * aspect, FRUSTUM_SIZE);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -0.5;

  return { mesh, canvas, ctx, texture, w, h };
}

/* ---------- Auto painter (mobile) ---------- */
class AutoPainter {
  constructor(frustumSize, aspect) {
    this.time = Math.random() * 100;
    this.halfW = (frustumSize * aspect) / 2 * 0.55;
    this.halfH = frustumSize / 2 * 0.45;
  }

  update(dt) {
    this.time += dt;
    const t = this.time * 0.18;
    return {
      x: Math.sin(t * 1.3) * this.halfW + Math.sin(t * 0.4) * this.halfW * 0.3,
      y: Math.sin(t * 0.7) * this.halfH + Math.cos(t * 0.3) * this.halfH * 0.2,
    };
  }
}

/* ========================================
   Main init function
   ======================================== */
export function initHero3D() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const segments = isMobile ? 16 : 32;
  let width = hero.offsetWidth;
  let height = hero.offsetHeight;
  let aspect = width / height;

  /* --- Renderer --- */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const canvas = renderer.domElement;
  canvas.classList.add('hero__canvas');
  hero.insertBefore(canvas, hero.firstChild);

  /* --- Scene --- */
  const scene = new THREE.Scene();

  /* --- Camera (orthographic) --- */
  const camera = new THREE.OrthographicCamera(
    -FRUSTUM_SIZE * aspect / 2,
     FRUSTUM_SIZE * aspect / 2,
     FRUSTUM_SIZE / 2,
    -FRUSTUM_SIZE / 2,
    0.1, 100
  );
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);

  /* --- Lights --- */
  const ambient = new THREE.AmbientLight(0xFFF5E6, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(-3, 5, 8);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xE8A87C, 0.4);
  fillLight.position.set(4, -2, 6);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x3A7A94, 0.25);
  rimLight.position.set(0, 0, -5);
  scene.add(rimLight);

  /* --- Paint surface --- */
  let paint = createPaintSurface(aspect, isMobile);
  scene.add(paint.mesh);

  /* --- Roller --- */
  const rollerGroup = createRoller(segments);
  scene.add(rollerGroup);
  const rollerCylinder = rollerGroup.getObjectByName('cylinder');

  /* --- Mouse state --- */
  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  let prevX = 0, prevY = 0;
  let isHovering = false;

  if (!isMobile) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetX = ndcX * (FRUSTUM_SIZE * aspect) / 2;
      targetY = ndcY * FRUSTUM_SIZE / 2;
      isHovering = true;
    });

    hero.addEventListener('mouseleave', () => {
      isHovering = false;
    });
  }

  /* --- Auto painter for mobile --- */
  const autoPainter = isMobile ? new AutoPainter(FRUSTUM_SIZE, aspect) : null;

  /* --- Splatoon-style paint logic --- */
  let currentColor = SPLAT_COLORS[0];
  let colorTimer = 0;
  const COLOR_SWITCH_INTERVAL = 4; // seconds between color changes

  function paintStroke(px, py, cx, cy) {
    const canvasX = ((cx / (FRUSTUM_SIZE * aspect)) + 0.5) * paint.w;
    const canvasY = ((-cy / FRUSTUM_SIZE) + 0.5) * paint.h;
    const prevCanvasX = ((px / (FRUSTUM_SIZE * aspect)) + 0.5) * paint.w;
    const prevCanvasY = ((-py / FRUSTUM_SIZE) + 0.5) * paint.h;

    const color = currentColor;
    const baseWidth = isMobile ? 70 : 110;

    // === MAIN PAINT BODY — thick, fully opaque, like Splatoon ink ===
    paint.ctx.save();
    paint.ctx.globalAlpha = 1.0;
    paint.ctx.strokeStyle = color;
    paint.ctx.lineWidth = baseWidth;
    paint.ctx.lineCap = 'round';
    paint.ctx.lineJoin = 'round';
    paint.ctx.beginPath();
    paint.ctx.moveTo(prevCanvasX, prevCanvasY);
    paint.ctx.lineTo(canvasX, canvasY);
    paint.ctx.stroke();
    paint.ctx.restore();

    // === GLOSSY HIGHLIGHT — white-ish sheen for wet paint look ===
    paint.ctx.save();
    paint.ctx.globalAlpha = 0.35;
    paint.ctx.strokeStyle = lightenColor(color, 35);
    paint.ctx.lineWidth = baseWidth * 0.3;
    paint.ctx.lineCap = 'round';
    paint.ctx.lineJoin = 'round';
    paint.ctx.beginPath();
    paint.ctx.moveTo(prevCanvasX - 5, prevCanvasY - 5);
    paint.ctx.lineTo(canvasX - 5, canvasY - 5);
    paint.ctx.stroke();
    paint.ctx.restore();

    // === DARK EDGE — depth/shadow on the opposite side ===
    paint.ctx.save();
    paint.ctx.globalAlpha = 0.3;
    paint.ctx.strokeStyle = darkenColor(color, 25);
    paint.ctx.lineWidth = baseWidth * 0.15;
    paint.ctx.lineCap = 'round';
    paint.ctx.lineJoin = 'round';
    paint.ctx.beginPath();
    paint.ctx.moveTo(prevCanvasX + baseWidth * 0.35, prevCanvasY + 4);
    paint.ctx.lineTo(canvasX + baseWidth * 0.35, canvasY + 4);
    paint.ctx.stroke();
    paint.ctx.restore();

    // === SPLATTER BLOBS — Splatoon-style spray around the stroke ===
    const segLen = Math.hypot(canvasX - prevCanvasX, canvasY - prevCanvasY);
    const numSplats = Math.min(Math.floor(segLen / 6), 25);
    paint.ctx.save();
    paint.ctx.globalAlpha = 1.0;
    paint.ctx.fillStyle = color;
    for (let i = 0; i < numSplats; i++) {
      const t = Math.random();
      const cx2 = prevCanvasX + (canvasX - prevCanvasX) * t;
      const cy2 = prevCanvasY + (canvasY - prevCanvasY) * t;
      const angle = Math.random() * Math.PI * 2;
      const spread = baseWidth * (0.5 + Math.random() * 0.7);
      const bx = cx2 + Math.cos(angle) * spread;
      const by = cy2 + Math.sin(angle) * spread;
      const blobSize = 3 + Math.random() * 12;
      // Draw irregular blob (2-3 overlapping circles)
      paint.ctx.beginPath();
      paint.ctx.arc(bx, by, blobSize, 0, Math.PI * 2);
      paint.ctx.fill();
      if (Math.random() > 0.5) {
        paint.ctx.beginPath();
        paint.ctx.arc(bx + blobSize * 0.4, by + blobSize * 0.3, blobSize * 0.7, 0, Math.PI * 2);
        paint.ctx.fill();
      }
    }
    paint.ctx.restore();

    // === GLOSSY SPECULAR DOTS — wet paint sparkle ===
    paint.ctx.save();
    const numSpecs = Math.min(Math.floor(segLen / 15), 8);
    for (let i = 0; i < numSpecs; i++) {
      const t = Math.random();
      const sx = prevCanvasX + (canvasX - prevCanvasX) * t + (Math.random() - 0.5) * baseWidth * 0.5;
      const sy = prevCanvasY + (canvasY - prevCanvasY) * t + (Math.random() - 0.5) * baseWidth * 0.5;
      paint.ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      paint.ctx.fillStyle = '#ffffff';
      const specSize = 2 + Math.random() * 4;
      paint.ctx.beginPath();
      paint.ctx.arc(sx, sy, specSize, 0, Math.PI * 2);
      paint.ctx.fill();
    }
    paint.ctx.restore();

    paint.texture.needsUpdate = true;
  }

  /* --- Animation --- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05); // cap delta

    prevX = curX;
    prevY = curY;

    // Update target position
    if (isMobile && autoPainter) {
      const pos = autoPainter.update(dt);
      targetX = pos.x;
      targetY = pos.y;
      isHovering = true;
    }

    // Smooth follow
    curX += (targetX - curX) * EASING;
    curY += (targetY - curY) * EASING;

    // Move roller
    rollerGroup.position.x = curX;
    rollerGroup.position.y = curY;

    // Rotate roller cylinder based on movement — very visible rotation
    const dx = curX - prevX;
    const dy = curY - prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (rollerCylinder) {
      // Strong rotation: dist / radius, amplified 3x for visual impact
      rollerCylinder.rotation.x += (dist / 0.32) * 3;
      // Also add a slow idle spin so it always looks alive
      if (dist < 0.001) {
        rollerCylinder.rotation.x += dt * 0.5;
      }
    }

    // Tilt roller in movement direction — more dramatic
    const tiltTarget = Math.atan2(dy, dx) * 0.15;
    rollerGroup.rotation.z += (tiltTarget - rollerGroup.rotation.z) * 0.08;

    // Gentle idle float
    rollerGroup.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.08 + 0.12;
    rollerGroup.position.z = 2.5 + Math.sin(clock.elapsedTime * 0.5) * 0.08;

    // Color cycling over time (Splatoon-style: one color at a time, switches periodically)
    colorTimer += dt;
    if (colorTimer >= COLOR_SWITCH_INTERVAL) {
      colorTimer = 0;
      const idx = SPLAT_COLORS.indexOf(currentColor);
      currentColor = SPLAT_COLORS[(idx + 1) % SPLAT_COLORS.length];
    }

    // Paint continuously — always leave a trail when hovering
    if (isHovering && dist > 0.005) {
      paintStroke(prevX, prevY, curX, curY);
    }

    renderer.render(scene, camera);
  }

  /* --- Resize (debounced) --- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = hero.offsetWidth;
      height = hero.offsetHeight;
      aspect = width / height;

      camera.left = -FRUSTUM_SIZE * aspect / 2;
      camera.right = FRUSTUM_SIZE * aspect / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      // Rebuild paint surface
      scene.remove(paint.mesh);
      paint.mesh.geometry.dispose();
      paint.mesh.material.dispose();
      paint.texture.dispose();
      paint = createPaintSurface(aspect, isMobile);
      scene.add(paint.mesh);

      if (autoPainter) {
        autoPainter.halfW = (FRUSTUM_SIZE * aspect) / 2 * 0.55;
        autoPainter.halfH = FRUSTUM_SIZE / 2 * 0.45;
      }
    }, 150);
  });

  /* --- Start --- */
  animate();
}
