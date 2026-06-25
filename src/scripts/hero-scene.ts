import * as THREE from "three";

// Escena de partículas tipo spray/splatter rosa que reacciona al mouse.
export function initHeroScene(canvas: HTMLCanvasElement): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  camera.position.z = 14;

  // Cantidad de partículas (menos en mobile)
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 900 : 2200;

  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    speeds[i] = 0.2 + Math.random() * 0.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // Textura circular suave para cada partícula
  const sprite = makeCircleTexture();

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.16 : 0.13,
    map: sprite,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color("#fd3692"),
    opacity: 0.9,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Un par de "salpicaduras" blancas
  const whiteMat = material.clone();
  whiteMat.color = new THREE.Color("#ffffff");
  whiteMat.size = (isMobile ? 0.16 : 0.13) * 0.7;
  whiteMat.opacity = 0.5;
  const whitePoints = new THREE.Points(geometry.clone(), whiteMat);
  whitePoints.scale.set(1.1, 1.1, 1.1);
  scene.add(whitePoints);

  // --- Tijeras 3D de fondo (abiertas, a la izquierda del título) ---
  const scissors = makeScissors();
  const scsX = isMobile ? -2 : -12;
  const scsY = isMobile ? 8 : 5;
  scissors.position.set(scsX, scsY, -1);
  scissors.scale.setScalar(isMobile ? 0.62 : 1.35);
  scissors.rotation.z = 0.4;
  scene.add(scissors);
  const armA = scissors.userData.armA as THREE.Group;
  const armB = scissors.userData.armB as THREE.Group;

  // Mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    points.rotation.y = t * 0.04 + mouse.x * 0.3;
    points.rotation.x = mouse.y * 0.2;
    whitePoints.rotation.y = t * 0.06 + mouse.x * 0.35;
    whitePoints.rotation.x = mouse.y * 0.25;

    // Tijeras abiertas (forma de X) con leve vaivén y parallax
    const spread = 0.5 + Math.sin(t * 0.8) * 0.07;
    armA.rotation.z = -spread;
    armB.rotation.z = spread;
    scissors.rotation.z = 0.4 + Math.sin(t * 0.3) * 0.05 + mouse.x * 0.1;
    scissors.rotation.y = mouse.x * 0.25;
    scissors.position.y = scsY + Math.sin(t * 0.5) * 0.25;

    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    if (!reduce) raf = requestAnimationFrame(tick);
  }
  tick();

  // Cleanup
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    whiteMat.dispose();
    sprite.dispose();
    scissors.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) (m.material as THREE.Material).dispose();
    });
    renderer.dispose();
  };
}

// Tijeras 3D estilizadas (wireframe rosa neón) con dos brazos articulados.
function makeScissors(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfd3692,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });

  const makeArm = (): THREE.Group => {
    const arm = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 4.4, 4), mat);
    blade.position.y = 2.2;
    blade.scale.z = 0.22;
    arm.add(blade);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.3, 0.14), mat);
    stem.position.y = -1.3;
    arm.add(stem);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.1, 14, 30), mat);
    ring.position.y = -2.85;
    arm.add(ring);
    return arm;
  };

  const armA = makeArm();
  const armB = makeArm();
  group.add(armA, armB);

  const screw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.42, 16),
    mat,
  );
  screw.rotation.x = Math.PI / 2;
  group.add(screw);

  group.userData.armA = armA;
  group.userData.armB = armB;
  return group;
}

function makeCircleTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.8)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}
