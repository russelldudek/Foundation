export async function createThreeScene({ root, canvas, reduceMotion, compactViewport, coarsePointer }) {
  if (!canvas || reduceMotion.matches || compactViewport.matches || !window.WebGLRenderingContext) return null;

  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061326, 0.105);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 9.2);

  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0x7caeff, 1.05));

  const key = new THREE.PointLight(0x43dfd1, 20, 12, 2);
  key.position.set(-1.8, 2.4, 4.2);
  scene.add(key);

  const rim = new THREE.PointLight(0x8b6fff, 18, 12, 2);
  rim.position.set(2.8, -1.5, 3.2);
  scene.add(rim);

  const decisionLight = new THREE.PointLight(0xe0ae61, 8, 9, 2);
  decisionLight.position.set(3.5, 0.4, 2.2);
  scene.add(decisionLight);

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0d6e9a,
    emissive: 0x07395f,
    emissiveIntensity: 1.05,
    roughness: 0.18,
    metalness: 0.32,
    transmission: 0.32,
    thickness: 1.1,
    transparent: true,
    opacity: 0.84
  });
  const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.02, 3), coreMaterial);
  group.add(coreMesh);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.13, 2)),
    new THREE.LineBasicMaterial({ color: 0x70f3e7, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
  );
  group.add(wire);

  const ringMaterials = [0x2f8cff, 0x43dfd1, 0x846cff].map(color => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  }));
  const rings = [
    new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.012, 8, 120), ringMaterials[0]),
    new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.01, 8, 120), ringMaterials[1]),
    new THREE.Mesh(new THREE.TorusGeometry(2.64, 0.008, 8, 120), ringMaterials[2])
  ];
  rings[0].rotation.set(1.05, 0.15, 0.2);
  rings[1].rotation.set(0.45, 0.85, 0.1);
  rings[2].rotation.set(1.35, -0.55, 0.25);
  rings.forEach(ring => group.add(ring));

  const inputPositions = [
    new THREE.Vector3(-3.25, 1.55, 0.1),
    new THREE.Vector3(-3.65, 0.5, -0.25),
    new THREE.Vector3(-3.45, -0.55, 0.2),
    new THREE.Vector3(-3.0, -1.6, -0.1)
  ];
  const outputPositions = [
    new THREE.Vector3(3.05, 1.55, -0.05),
    new THREE.Vector3(3.55, 0.5, 0.22),
    new THREE.Vector3(3.45, -0.55, -0.18),
    new THREE.Vector3(3.0, -1.6, 0.08)
  ];

  const nodeGeometry = new THREE.SphereGeometry(0.095, 16, 16);
  const inputNodes = inputPositions.map(position => {
    const mesh = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: 0x62b7ff }));
    mesh.position.copy(position);
    group.add(mesh);
    return mesh;
  });
  const outputNodes = outputPositions.map(position => {
    const mesh = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: 0xe0ae61 }));
    mesh.position.copy(position);
    group.add(mesh);
    return mesh;
  });

  const lineBetween = (points, color, opacity) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending })
    );
    group.add(line);
    return line;
  };

  const inputLines = inputPositions.map((position, index) => lineBetween([
    position,
    new THREE.Vector3(-2.05 + index * 0.1, position.y * 0.6, position.z * 0.4),
    new THREE.Vector3(-0.9, position.y * 0.22, 0)
  ], index % 2 ? 0x43dfd1 : 0x2f8cff, 0.28));
  const outputLines = outputPositions.map((position, index) => lineBetween([
    new THREE.Vector3(0.9, position.y * 0.22, 0),
    new THREE.Vector3(2.05 - index * 0.08, position.y * 0.6, position.z * 0.4),
    position
  ], index % 2 ? 0xd99a50 : 0xe7bd73, 0.22));

  const particleCount = 540;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 2.2 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.45;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    color: 0x5baeff,
    size: 0.022,
    transparent: true,
    opacity: 0.44,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  group.add(particles);

  const makeGlowTexture = () => {
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const context = glowCanvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(110,255,242,1)');
    gradient.addColorStop(0.15, 'rgba(75,218,255,.75)');
    gradient.addColorStop(0.5, 'rgba(47,140,255,.2)');
    gradient.addColorStop(1, 'rgba(47,140,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(glowCanvas);
  };

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  glow.scale.set(4.4, 4.4, 1);
  group.add(glow);

  const pulseTexture = makeGlowTexture();
  const pulses = [...inputPositions, ...outputPositions].map((position, index) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: pulseTexture,
      color: index < 4 ? 0x62caff : 0xe7bd73,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    sprite.scale.set(0.34, 0.34, 1);
    sprite.position.copy(position);
    group.add(sprite);
    return sprite;
  });

  let stage = 0;
  let pulseStart = performance.now();
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let running = true;

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  root.addEventListener('pointermove', event => {
    if (coarsePointer.matches) return;
    const rect = root.getBoundingClientRect();
    targetPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7;
    targetPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.45;
  });
  root.addEventListener('pointerleave', () => {
    targetPointerX = 0;
    targetPointerY = 0;
  });

  const observer = new IntersectionObserver(entries => {
    running = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0.04 });
  observer.observe(root);

  const setStage = nextStage => {
    stage = nextStage;
    pulseStart = performance.now();
    const palette = [0x2f8cff, 0x43dfd1, 0xe0ae61];
    coreMaterial.emissive.setHex(stage === 2 ? 0x5f3c12 : stage === 1 ? 0x07594e : 0x07395f);
    wire.material.color.setHex(palette[stage]);
    decisionLight.intensity = stage === 2 ? 26 : 8;
  };

  const animate = now => {
    requestAnimationFrame(animate);
    if (!running) return;
    const time = now * 0.001;
    pointerX += (targetPointerX - pointerX) * 0.035;
    pointerY += (targetPointerY - pointerY) * 0.035;

    group.rotation.y = pointerX + Math.sin(time * 0.18) * 0.05;
    group.rotation.x = -pointerY + Math.cos(time * 0.15) * 0.025;
    coreMesh.rotation.x = time * 0.11;
    coreMesh.rotation.y = time * 0.15;
    wire.rotation.x = -time * 0.08;
    wire.rotation.y = time * 0.18;
    rings[0].rotation.z = time * 0.1;
    rings[1].rotation.z = -time * 0.08;
    rings[2].rotation.z = time * 0.055;
    particles.rotation.y = time * 0.018;
    particles.rotation.z = Math.sin(time * 0.1) * 0.03;

    const stageEnergy = stage === 1 ? 1.18 : stage === 2 ? 1.08 : 1;
    const breathing = 1 + Math.sin(time * 1.8) * 0.025;
    coreMesh.scale.setScalar(stageEnergy * breathing);
    wire.scale.setScalar(stageEnergy * (1.015 + Math.sin(time * 1.5) * 0.02));
    glow.material.opacity = 0.34 + stage * 0.07 + Math.sin(time * 1.35) * 0.04;
    glow.scale.setScalar(4.1 + stage * 0.5 + Math.sin(time * 1.2) * 0.16);

    inputLines.forEach((line, index) => {
      line.material.opacity = stage === 0 ? 0.56 + Math.sin(time * 2 + index) * 0.12 : 0.23;
    });
    outputLines.forEach((line, index) => {
      line.material.opacity = stage === 2 ? 0.56 + Math.sin(time * 2 + index) * 0.12 : 0.16;
    });
    inputNodes.forEach((node, index) => node.scale.setScalar(stage === 0 ? 1.25 + Math.sin(time * 2.3 + index) * 0.16 : 0.92));
    outputNodes.forEach((node, index) => node.scale.setScalar(stage === 2 ? 1.28 + Math.sin(time * 2.2 + index) * 0.17 : 0.86));

    const pulseTime = Math.min(1, (now - pulseStart) / 1050);
    pulses.forEach((sprite, index) => {
      const local = Math.max(0, Math.min(1, pulseTime * 1.6 - index * 0.07));
      sprite.material.opacity = Math.sin(local * Math.PI) * 0.72;
      sprite.scale.setScalar(0.28 + Math.sin(local * Math.PI) * 0.48);
    });

    camera.position.x = pointerX * 0.55;
    camera.position.y = 0.35 - pointerY * 0.45;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(animate);

  return {
    setStage,
    reset() {
      setStage(0);
    },
    pulse() {
      pulseStart = performance.now();
    }
  };
}
