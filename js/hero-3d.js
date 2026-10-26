/* ---------- Escena 3D de la portada ----------
   Jaula octagonal con dos luchadores articulados que intercambian golpes.
   Todo es procedural (sin modelos externos). Para usar modelos GLB, ver README. */
(function () {
  var hero = document.getElementById("inicio");
  var canvas = document.getElementById("stage");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (typeof THREE === "undefined" || lowEnd) { hero.classList.add("no-gl"); return; }

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { hero.classList.add("no-gl"); return; }
  if (!renderer || !renderer.getContext()) { hero.classList.add("no-gl"); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0908, 0.022);
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  var world = new THREE.Group(); scene.add(world);

  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ----- luces ----- */
  world.add(new THREE.HemisphereLight(0xffe2a8, 0x1a120a, 0.5));
  var key = new THREE.SpotLight(0xffd990, 2.6, 40, 0.62, 0.6, 1);
  key.position.set(0, 11, 1.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
  world.add(key, key.target); key.target.position.set(0, 1, 0);
  var rimA = new THREE.PointLight(0xd6a73c, 1.6, 24); rimA.position.set(-6, 3.2, -4); world.add(rimA);
  var rimB = new THREE.PointLight(0xff9b3d, 1.5, 24); rimB.position.set(6, 3.2, 4); world.add(rimB);
  var back = new THREE.PointLight(0xffffff, 1.0, 20); back.position.set(0, 4, -7); world.add(back);

  /* ----- materiales ----- */
  var M = function (color, rough, metal, extra) {
    var o = { color: color, roughness: rough, metalness: metal || 0 };
    if (extra) for (var k in extra) o[k] = extra[k];
    return new THREE.MeshStandardMaterial(o);
  };
  var gold = M(0xd6a73c, 0.3, 0.9);
  var padMat = M(0x0f0d0b, 0.7, 0.1);
  var R = 4, H = 1.95;

  /* ----- piso con anillo y logo ----- */
  var c = document.createElement("canvas"); c.width = c.height = 1024;
  var g = c.getContext("2d");
  var grad = g.createRadialGradient(512, 512, 40, 512, 512, 512);
  grad.addColorStop(0, "#2a2013"); grad.addColorStop(1, "#120e09");
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 1024);
  g.strokeStyle = "#d6a73c"; g.lineWidth = 14; g.beginPath(); g.arc(512, 512, 470, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.arc(512, 512, 300, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#d6a73c"; g.font = "italic 800 300px 'Barlow Condensed', Impact, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("UGP", 512, 530);
  var floorTex = new THREE.CanvasTexture(c);
  floorTex.anisotropy = 4; floorTex.wrapS = THREE.RepeatWrapping; floorTex.repeat.x = -1;
  var floor = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.3, 8, 1),
    [M(0x1c1610, 0.8), M(0xffffff, 0.42, 0.15, { map: floorTex }), M(0x0b0908, 1)]);
  floor.position.y = -0.15; floor.receiveShadow = true;
  var cage = new THREE.Group(); cage.add(floor);

  /* ----- jaula: malla, postes, barandas y acolchado ----- */
  var m = document.createElement("canvas"); m.width = m.height = 64;
  var mg = m.getContext("2d"); mg.strokeStyle = "rgba(214,167,60,0.6)"; mg.lineWidth = 2;
  mg.beginPath(); mg.moveTo(0, 0); mg.lineTo(64, 64); mg.moveTo(64, 0); mg.lineTo(0, 64); mg.stroke();
  var meshTex = new THREE.CanvasTexture(m); meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(6, 3);
  var meshMat = new THREE.MeshBasicMaterial({ map: meshTex, transparent: true, side: THREE.DoubleSide, depthWrite: false });

  var pts = [];
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; pts.push(new THREE.Vector3(R * Math.sin(a), 0, R * Math.cos(a))); }
  var Y = new THREE.Vector3(0, 1, 0);
  function between(a, b, r, mat, y) {
    var A = a.clone(); A.y = y; var B = b.clone(); B.y = y;
    var mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 10), mat);
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, B.clone().sub(A).normalize());
    return mesh;
  }
  pts.forEach(function (p, i) {
    var q = pts[(i + 1) % 8];
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, H, 12), gold);
    post.position.set(p.x, H / 2, p.z); post.castShadow = true; cage.add(post);
    var pad = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.95, 12), padMat);
    pad.position.set(p.x, 0.47, p.z); cage.add(pad);
    var wall = new THREE.Mesh(new THREE.PlaneGeometry(p.distanceTo(q), H - 0.2), meshMat);
    wall.position.set((p.x + q.x) / 2, H / 2 + 0.05, (p.z + q.z) / 2);
    wall.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + Math.PI / 2;
    cage.add(wall);
    cage.add(between(p, q, 0.06, gold, H));
    cage.add(between(p, q, 0.05, gold, 1.25));
    cage.add(between(p, q, 0.12, padMat, 0.6));
    cage.add(between(p, q, 0.04, gold, 0.98));
  });
  world.add(cage);

  /* ----- aro de luces, haces, polvo y público ----- */
  var ring = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.07, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 7.6; world.add(ring);

  var beams = [];
  for (var b = 0; b < 4; b++) {
    var cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 8.4, 28, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    cone.userData.ang = b * Math.PI / 2 + 0.4;
    world.add(cone); beams.push(cone);
  }

  var sc = document.createElement("canvas"); sc.width = sc.height = 32;
  var sg2 = sc.getContext("2d"), sgr = sg2.createRadialGradient(16, 16, 0, 16, 16, 16);
  sgr.addColorStop(0, "rgba(255,255,255,1)"); sgr.addColorStop(0.4, "rgba(255,255,255,0.5)"); sgr.addColorStop(1, "rgba(255,255,255,0)");
  sg2.fillStyle = sgr; sg2.fillRect(0, 0, 32, 32);
  var sprite = new THREE.CanvasTexture(sc);

  var DUST = 140, dustGeo = new THREE.BufferGeometry(), dustPos = new Float32Array(DUST * 3), dustSpd = [];
  for (var d = 0; d < DUST; d++) {
    var ra = Math.sqrt(Math.random()) * 5, th = Math.random() * 6.283;
    dustPos[d * 3] = Math.cos(th) * ra; dustPos[d * 3 + 1] = Math.random() * 7; dustPos[d * 3 + 2] = Math.sin(th) * ra;
    dustSpd.push(0.06 + Math.random() * 0.14);
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  world.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffe2a8, map: sprite, size: 0.09, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })));

  var CROWD = 520, crowdGeo = new THREE.BufferGeometry(), crowdPos = new Float32Array(CROWD * 3), crowdCol = new Float32Array(CROWD * 3);
  for (var k = 0; k < CROWD; k++) {
    var tier = Math.floor(Math.random() * 5), rr = 9.5 + tier * 1.6 + Math.random() * 0.8;
    var ph = 1.25 + Math.random() * (Math.PI * 2 - 2.5);
    crowdPos[k * 3] = Math.sin(ph) * rr; crowdPos[k * 3 + 1] = 0.8 + tier * 1.0 + Math.random() * 0.4; crowdPos[k * 3 + 2] = Math.cos(ph) * rr;
    var dim = 0.10 + Math.random() * 0.12; crowdCol[k * 3] = dim * 1.2; crowdCol[k * 3 + 1] = dim; crowdCol[k * 3 + 2] = dim * 0.7;
  }
  crowdGeo.setAttribute("position", new THREE.BufferAttribute(crowdPos, 3));
  crowdGeo.setAttribute("color", new THREE.BufferAttribute(crowdCol, 3));
  world.add(new THREE.Points(crowdGeo, new THREE.PointsMaterial({ map: sprite, size: 0.5, vertexColors: true, sizeAttenuation: true, transparent: true, depthWrite: false })));

  /* ----- luchadores articulados ----- */
  // Los segmentos cuelgan hacia -y desde su articulación; +z es la derecha del luchador, y mira hacia +x.
  function limb(len, rTop, rBot, mat) {
    var grp = new THREE.Group();
    var cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, 14), mat); cyl.position.y = -len / 2;
    var top = new THREE.Mesh(new THREE.SphereGeometry(rTop, 14, 12), mat);
    var bot = new THREE.Mesh(new THREE.SphereGeometry(rBot, 12, 10), mat); bot.position.y = -len;
    [cyl, top, bot].forEach(function (x) { x.castShadow = true; grp.add(x); });
    return grp;
  }
  function blob(rx, ry, rz, mat, x, y, z) {
    var s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 14), mat);
    s.scale.set(rx, ry, rz); s.position.set(x || 0, y || 0, z || 0); s.castShadow = true; return s;
  }
  function makeFighter(o) {
    var skin = M(o.skin, 0.52, 0.04), trunk = M(o.trunk, 0.32, 0.35), glove = M(o.glove, 0.4, 0.15), hair = M(o.hair, 0.85, 0), shoe = M(0x0c0b0a, 0.5, 0.1);
    var F = { root: new THREE.Group(), arm: [], fore: [], hip: [], knee: [] };
    var pelvis = F.pelvis = new THREE.Group(); pelvis.position.y = 0.95; F.root.add(pelvis);
    var hips = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.32, 16), trunk); hips.position.y = -0.02; hips.castShadow = true; pelvis.add(hips);
    var band = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.05, 16), gold); band.position.y = 0.15; pelvis.add(band);

    var spine = F.spine = new THREE.Group(); spine.position.y = 0.16; pelvis.add(spine);
    var abs = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.32, 14), skin); abs.position.y = 0.12; abs.castShadow = true; spine.add(abs);
    spine.add(blob(0.2, 0.26, 0.31, skin, 0, 0.42, 0));      // pecho
    spine.add(blob(0.17, 0.08, 0.3, skin, -0.02, 0.62, 0));  // trapecios
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.14, 12), skin); neck.position.y = 0.7; spine.add(neck);

    var head = F.head = new THREE.Group(); head.position.y = 0.76; spine.add(head);
    head.add(blob(0.115, 0.135, 0.105, skin, 0.01, 0.1, 0));
    head.add(blob(0.07, 0.06, 0.085, skin, 0.045, 0.03, 0));  // mandíbula
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.122, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
    cap.position.set(-0.01, 0.13, 0); cap.scale.set(1, 1.05, 0.95); head.add(cap);

    [1, -1].forEach(function (sg, i) {
      var sh = new THREE.Group(); sh.position.set(0, 0.57, sg * 0.31); spine.add(sh); F.arm[i] = sh;
      sh.add(blob(0.1, 0.1, 0.1, skin));
      var up = limb(0.31, 0.075, 0.06, skin); sh.add(up);
      var el = new THREE.Group(); el.position.y = -0.31; sh.add(el); F.fore[i] = el;
      el.add(limb(0.28, 0.06, 0.045, skin));
      var fist = blob(0.09, 0.085, 0.085, glove, 0, -0.31, 0); el.add(fist);

      var hp = new THREE.Group(); hp.position.set(0, -0.08, sg * 0.12); pelvis.add(hp); F.hip[i] = hp;
      hp.add(limb(0.5, 0.115, 0.078, skin));
      var sl = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.125, 0.3, 14), trunk); sl.position.y = -0.15; sl.castShadow = true; hp.add(sl);
      var kn = new THREE.Group(); kn.position.y = -0.5; hp.add(kn); F.knee[i] = kn;
      kn.add(limb(0.48, 0.075, 0.052, skin));
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.075, 0.1), shoe); foot.position.set(0.06, -0.52, 0); foot.castShadow = true; kn.add(foot);
    });
    F.root.scale.setScalar(0.92);
    F.root.traverse(function (x) { if (x.isMesh) x.receiveShadow = false; });
    return F;
  }
  var A = makeFighter({ skin: 0xa8734f, trunk: 0x121212, glove: 0x1c1c1c, hair: 0x0e0b09 });
  var B = makeFighter({ skin: 0x7a523a, trunk: 0xe8e0cf, glove: 0xb8892b, hair: 0x15100c });
  var pair = new THREE.Group(); world.add(pair);
  A.root.position.x = -1.05; B.root.position.x = 1.05; B.root.rotation.y = Math.PI;
  pair.add(A.root, B.root);

  /* ----- coreografía: lista de ataques en un ciclo de 8 s ----- */
  var PERIOD = 8;
  var plan = [
    { who: 0, type: "jab", t: 0.5, d: 0.42 }, { who: 0, type: "cross", t: 0.98, d: 0.5 },
    { who: 1, type: "kick", t: 2.4, d: 0.85 },
    { who: 0, type: "jab", t: 3.9, d: 0.4 }, { who: 1, type: "jab", t: 4.5, d: 0.4 }, { who: 1, type: "cross", t: 4.95, d: 0.5 },
    { who: 0, type: "kick", t: 6.2, d: 0.9 }
  ];
  function env(t, a) { var x = (t - a.t) / a.d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); }
  function impactBump(t, a) {
    var x = (t - (a.t + a.d * 0.5)) / 0.5; if (x < 0 || x > 1) return 0;
    return Math.sin(Math.min(1, x * 3) * Math.PI / 2) * (1 - x);
  }

  // jugador 0 = quien ataca; el índice de brazo 1 (z-) es el adelantado
  function applyPose(F, t, who) {
    var jab = 0, cross = 0, kick = 0, hit = 0, kickPhase = 0, i, a;
    for (i = 0; i < plan.length; i++) {
      a = plan[i];
      if (a.who === who) {
        var e = env(t, a);
        if (a.type === "jab") jab = Math.max(jab, e);
        else if (a.type === "cross") cross = Math.max(cross, e);
        else { kick = Math.max(kick, e); if (e > 0) kickPhase = (t - a.t) / a.d; }
      } else { hit = Math.max(hit, impactBump(t, a) * (a.type === "kick" ? 1.25 : a.type === "cross" ? 1 : 0.65)); }
    }
    var ph = who ? 1.7 : 0, s = Math.sin(t * 2.6 + ph), s2 = Math.sin(t * 5.2 + ph);
    var atk = Math.max(jab, cross, kick);

    F.pelvis.position.y = 0.95 + s2 * 0.018 - kick * 0.02 + 0.05 * (1 - smooth(0, 0.5, atk));
    F.pelvis.position.x = 0.28 * Math.max(jab, cross) - 0.34 * hit + s * 0.05;
    F.pelvis.position.z = Math.sin(t * 1.3 + ph) * 0.05;
    F.pelvis.rotation.y = -0.15 + (cross * 0.3);

    // piernas: posición de guardia + rebote
    var flex = 0.06 * s2;
    F.hip[1].rotation.z = 0.38 + flex;  F.knee[1].rotation.z = -0.55 - flex;
    F.hip[0].rotation.z = -0.28 - flex; F.knee[0].rotation.z = -0.22 + flex;
    F.hip[0].rotation.x = -0.09; F.hip[1].rotation.x = 0.09;
    if (kick > 0) {
      var ext = smooth(0.3, 0.5, kickPhase) * (1 - smooth(0.55, 0.8, kickPhase));
      F.hip[0].rotation.z = lerp(-0.28, 1.55, Math.pow(kick, 0.7));
      F.knee[0].rotation.z = -0.22 - 1.1 * kick * (1 - ext);
      F.hip[0].rotation.x = 0.0;
      F.hip[1].rotation.z -= 0.18 * kick;
    }

    // tronco
    F.spine.rotation.z = -0.12 - 0.1 * Math.max(jab, cross) + 0.45 * kick + 0.38 * hit;
    F.spine.rotation.y = -0.28 * jab + 0.5 * cross + 0.05 * s;
    F.spine.rotation.x = 0.05 * s;
    F.head.rotation.z = 0.1 - 0.12 * Math.max(jab, cross) + 0.3 * hit;
    F.head.rotation.y = -F.spine.rotation.y * 0.6 + (hit * 0.25 * (who ? 1 : -1));

    // brazos: guardia, golpes y defensa
    var coverLead = cross > 0 && jab === 0;   // el brazo adelantado cubre mientras el trasero golpea
    F.arm[1].rotation.z = coverLead ? 0.7 : lerp(0.58 + 0.05 * s, 1.5, jab);
    F.fore[1].rotation.z = coverLead ? 2.2 : lerp(2.0, 0.1, jab);
    F.arm[0].rotation.z = lerp(0.62 - 0.05 * s, 1.45, cross);
    F.fore[0].rotation.z = lerp(2.15, 0.12, cross);
    F.arm[0].rotation.x = -0.12; F.arm[1].rotation.x = 0.12;
    if (hit > 0.05) { F.arm[0].rotation.z += 0.3 * hit; F.arm[1].rotation.z += 0.3 * hit; }
    return hit;
  }

  /* ----- animación y cámara ----- */
  var vis = true, raf = 0, disposed = false, baseAng = 0.3, shake = 0;
  var dustBase = dustGeo.attributes.position.array;
  function update(s) {
    var t = s % PERIOD;
    var h1 = applyPose(A, t, 0), h2 = applyPose(B, t, 1);
    var hit = Math.max(h1, h2);
    pair.rotation.y = Math.sin(s * 0.28) * 0.35;           // los luchadores giran en la jaula
    key.intensity = 2.6 + Math.sin(s * 0.9) * 0.2 + hit * 1.6;
    rimA.intensity = 1.6 + hit * 1.0;
    ring.material.color.setHex(hit > 0.4 ? 0xfff0c8 : 0xffd27a);
    beams.forEach(function (bm, i) {
      var an = bm.userData.ang + Math.sin(s * 0.35 + i) * 0.25;
      bm.position.set(Math.sin(an) * 2.6, 4.2, Math.cos(an) * 2.6);
      bm.rotation.set(Math.sin(an) * 0.28, 0, -Math.cos(an) * 0.28);
      bm.material.opacity = 0.032 + 0.016 * Math.sin(s * 0.8 + i * 1.4);
    });
    for (var d = 0; d < DUST; d++) {
      var y = dustBase[d * 3 + 1] + dustSpd[d] * 0.016;
      dustBase[d * 3 + 1] = y > 7 ? 0 : y;
      dustBase[d * 3] += Math.sin(s * 0.5 + d) * 0.0015;
    }
    dustGeo.attributes.position.needsUpdate = true;
    if (((s * 60) | 0) % 5 === 0) {   // flashes de celulares entre el público
      var ci = crowdGeo.attributes.color.array;
      for (var f = 0; f < 6; f++) { var n = (Math.random() * CROWD) | 0, on = Math.random() < 0.4 ? 0.9 : 0.1; ci[n * 3] = on; ci[n * 3 + 1] = on * 0.95; ci[n * 3 + 2] = on * 0.8; }
      crowdGeo.attributes.color.needsUpdate = true;
    }
    shake = Math.max(shake * 0.9, hit);
    return s;
  }
  function place(wide, s) {
    var rad = (wide ? 11 : 17) + Math.sin(s * 0.17) * 0.9;
    var cy = (wide ? 3.6 : 7.5) + Math.sin(s * 0.23) * 0.4;
    var ang = baseAng + Math.sin(s * 0.22) * 0.34;
    var sx = Math.sin(s * 63) * 0.045 * shake, sy = Math.cos(s * 71) * 0.045 * shake;
    camera.position.set(Math.sin(ang) * rad * 0.4 + sx, cy + sy, Math.cos(ang) * rad);
    camera.lookAt(0, wide ? 1.0 : 3.9, 0);
  }
  function draw() { renderer.render(scene, camera); }
  function frame(t) {
    if (disposed) return;
    raf = 0; if (!vis) return;
    var s = t / 1000;
    update(s); place(hero.clientWidth > 760, s); draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!reduce && vis && !raf && !disposed) raf = requestAnimationFrame(frame); }

  function onResize() {
    var w = hero.clientWidth, h = hero.clientHeight, wide = w > 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    world.position.x = wide ? 3.4 : 0;
    place(wide, reduce ? 1.9 : 0);
    if (reduce) update(1.1);      // un solo cuadro estático en pleno intercambio
    draw();
  }
  var ro = ("ResizeObserver" in window) ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(hero); else window.addEventListener("resize", onResize);
  onResize();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { vis = !document.hidden; if (vis) start(); });
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); hero.classList.add("no-gl"); });
  start();

  window.addEventListener("pagehide", function () {
    disposed = true; if (raf) cancelAnimationFrame(raf);
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (mm) { if (mm.map) mm.map.dispose(); mm.dispose(); });
    });
    renderer.dispose();
  });
})();
