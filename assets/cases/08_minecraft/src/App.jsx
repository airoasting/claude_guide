import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const keyState = {};
const worldObjects = [];
const solidBounds = [];
const animatedWater = [];
const driftingClouds = [];

const palette = {
  skyTop: "#9fd2ff",
  skyBottom: "#f6fdff",
  grass: "#98c97f",
  grassDark: "#78ac61",
  dirt: "#7d5c42",
  stone: "#ded7c8",
  stoneDark: "#c5bcaa",
  roof: "#39373d",
  roofAccent: "#53525a",
  wood: "#76553b",
  pillar: "#8d2d24",
  beam: "#d8c7a4",
  water: "#71c8f3",
  waterDeep: "#4da8dc",
  leaf: "#b7d996",
  leafDark: "#96be75",
  bamboo: "#87c46b",
  blossom: "#f6b2c6",
  trunk: "#442c1c",
  lantern: "#f9dc79",
  path: "#c9baa7",
  fog: "#dcebd8",
  catFur: "#d79b45",
  catFurShadow: "#a56323",
  catFace: "#f0d5a6",
  catInnerEar: "#e7b7c7",
  catEye: "#5a8e44",
  catPupil: "#223029",
  catNose: "#c98b97",
  catWhisker: "#eef4f8",
  catBoot: "#33211a",
  catBootCuff: "#ba9a5a",
  catHat: "#201612",
  catHatBand: "#c8a347",
  catFeather: "#bc2d26",
  grassLight: "#b8dda0",
  stoneAccent: "#b6ab98",
};

function addVoxelBox(scene, size, position, color, options = {}) {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.rotationY) {
    mesh.rotation.y = options.rotationY;
  }
  scene.add(mesh);
  worldObjects.push(mesh);
  if (options.solid !== false) {
    const box = new THREE.Box3().setFromObject(mesh).expandByScalar(options.expand ?? 0);
    solidBounds.push(box);
  }
  return mesh;
}

function addGroupedBounds(bounds) {
  solidBounds.push(...bounds);
}

function makeTree(scene, x, z, scale = 1) {
  addVoxelBox(scene, [0.8 * scale, 2.8 * scale, 0.8 * scale], [x, 1.4 * scale, z], palette.trunk, {
    expand: 0.15,
  });
  addVoxelBox(scene, [2.8 * scale, 1.8 * scale, 2.8 * scale], [x, 3.1 * scale, z], palette.leaf, {
    expand: 0.15,
  });
  addVoxelBox(scene, [1.7 * scale, 1.4 * scale, 1.7 * scale], [x + 0.3 * scale, 4 * scale, z - 0.3 * scale], palette.leafDark, {
    solid: false,
  });
}

function makeBlossomTree(scene, x, z) {
  addVoxelBox(scene, [0.7, 2.6, 0.7], [x, 1.3, z], palette.trunk, {
    expand: 0.15,
  });
  addVoxelBox(scene, [2.3, 1.4, 2.3], [x, 3, z], palette.blossom, {
    expand: 0.15,
  });
  addVoxelBox(scene, [1.1, 0.9, 1.1], [x - 0.6, 3.8, z + 0.4], "#ffd4e3", {
    solid: false,
  });
}

function makeBamboo(scene, x, z, height = 3.6) {
  addVoxelBox(scene, [0.22, height, 0.22], [x, height / 2, z], palette.bamboo, {
    expand: 0.1,
  });
  addVoxelBox(scene, [0.7, 0.18, 0.18], [x + 0.25, height * 0.68, z], palette.leafDark, { solid: false });
  addVoxelBox(scene, [0.18, 0.18, 0.7], [x, height * 0.82, z - 0.2], palette.leafDark, { solid: false });
}

function makeLantern(scene, x, y, z) {
  addVoxelBox(scene, [0.18, 1.3, 0.18], [x, y + 0.65, z], palette.wood, {
    expand: 0.08,
  });
  addVoxelBox(scene, [0.42, 0.42, 0.42], [x, y + 1.45, z], palette.lantern, {
    solid: false,
  });
  const glow = new THREE.PointLight(0xffd88a, 0.7, 10, 2.2);
  glow.position.set(x, y + 1.45, z);
  scene.add(glow);
}

function createTemple(scene) {
  const templeBounds = [];
  const markSolid = (min, max) => templeBounds.push(new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max)));

  addVoxelBox(scene, [22, 1.2, 18], [0, 0.6, 0], palette.stone);
  addVoxelBox(scene, [18, 0.8, 14], [0, 1.6, 0], palette.stoneDark);
  addVoxelBox(scene, [14, 0.8, 10], [0, 2.4, 0], palette.stone);
  markSolid([-11, 0, -9], [11, 1.2, 9]);
  markSolid([-9, 1.2, -7], [9, 2, 7]);
  markSolid([-7, 2, -5], [7, 2.8, 5]);

  for (let i = -3; i <= 3; i += 2) {
    addVoxelBox(scene, [0.8, 5.8, 0.8], [i * 1.7, 5.7, 5.4], palette.pillar);
    addVoxelBox(scene, [0.8, 5.8, 0.8], [i * 1.7, 5.7, -3.8], palette.pillar);
  }

  for (let z = -2; z <= 4; z += 2) {
    addVoxelBox(scene, [0.8, 5.8, 0.8], [-6, 5.7, z], palette.pillar);
    addVoxelBox(scene, [0.8, 5.8, 0.8], [6, 5.7, z], palette.pillar);
  }

  addVoxelBox(scene, [14, 0.7, 11], [0, 8.75, 0.8], palette.beam);
  addVoxelBox(scene, [15.8, 0.5, 12.8], [0, 9.25, 0.8], palette.roof, { solid: false });
  addVoxelBox(scene, [13.2, 0.4, 10.2], [0, 9.7, 0.8], palette.roofAccent, { solid: false });

  addVoxelBox(scene, [9.5, 4.1, 5], [0, 11.15, 0.8], palette.pillar, { solid: false });
  addVoxelBox(scene, [10.8, 0.55, 6.5], [0, 13.45, 0.8], palette.roof, { solid: false });
  addVoxelBox(scene, [8.7, 0.35, 4.7], [0, 13.9, 0.8], palette.roofAccent, { solid: false });
  markSolid([-7, 2.8, -5], [-5.8, 13.5, 6.5]);
  markSolid([5.8, 2.8, -5], [7, 13.5, 6.5]);
  markSolid([-7, 2.8, -5], [7, 13.5, -3.2]);

  addVoxelBox(scene, [3.4, 4, 2.8], [0, 15.9, 0.8], palette.pillar, { solid: false });
  addVoxelBox(scene, [4.7, 0.45, 4], [0, 18.1, 0.8], palette.roof, { solid: false });
  markSolid([-1.7, 13.8, -0.6], [-0.8, 18.2, 2.2]);
  markSolid([0.8, 13.8, -0.6], [1.7, 18.2, 2.2]);
  markSolid([-1.7, 13.8, -0.6], [1.7, 18.2, 0.2]);

  addVoxelBox(scene, [3.1, 2.8, 0.6], [-4.45, 4.3, 5.5], palette.wood);
  addVoxelBox(scene, [3.1, 2.8, 0.6], [4.45, 4.3, 5.5], palette.wood);
  addVoxelBox(scene, [2.2, 0.55, 0.6], [0, 5.45, 5.5], palette.beam, { solid: false });
  addVoxelBox(scene, [11.6, 2.8, 0.6], [0, 4.3, -3.8], palette.wood);
  addVoxelBox(scene, [0.6, 2.8, 8.4], [-6, 4.3, 0.2], palette.wood);
  addVoxelBox(scene, [0.6, 2.8, 8.4], [6, 4.3, 0.2], palette.wood);

  for (let i = -3; i <= 3; i += 2) {
    addVoxelBox(scene, [0.9, 0.25, 0.25], [i * 1.7, 6.3, 5.4], palette.beam, { solid: false });
    addVoxelBox(scene, [0.9, 0.25, 0.25], [i * 1.7, 6.3, -3.8], palette.beam, { solid: false });
  }

  for (let step = 0; step < 5; step += 1) {
    addVoxelBox(
      scene,
      [8.5 - step * 0.35, 0.45, 1.8],
      [0, 2.05 - step * 0.45, 8.2 + step * 1.2],
      palette.stone,
      { solid: false },
    );
  }

  addGroupedBounds(templeBounds);
}

function createGate(scene) {
  addVoxelBox(scene, [8, 0.6, 1.6], [0, 2.9, 16], palette.roof);
  addVoxelBox(scene, [6.6, 0.35, 0.9], [0, 3.35, 16], palette.roofAccent, { solid: false });
  addVoxelBox(scene, [0.8, 4.8, 0.8], [-2.4, 1.9, 16], palette.wood);
  addVoxelBox(scene, [0.8, 4.8, 0.8], [2.4, 1.9, 16], palette.wood);
  addVoxelBox(scene, [6, 0.45, 0.7], [0, 0.25, 16], palette.stone);
}

function createPond(scene) {
  const pondTop = addVoxelBox(scene, [5.2, 0.3, 5.2], [-7.8, 0.15, 11], palette.water, { solid: false, receiveShadow: true });
  const pondDeep = addVoxelBox(scene, [3.5, 0.25, 3.5], [-7.2, 0.12, 11.4], palette.waterDeep, { solid: false, receiveShadow: true });
  animatedWater.push(
    { mesh: pondTop, baseY: 0.15, phase: 0 },
    { mesh: pondDeep, baseY: 0.12, phase: 1.2 },
  );
  addVoxelBox(scene, [6.4, 0.4, 0.7], [-6.9, 0.2, 13.8], palette.stoneDark);
  addVoxelBox(scene, [0.7, 0.4, 4.8], [-10.2, 0.2, 11.2], palette.stoneDark);
  addVoxelBox(scene, [4.8, 0.4, 0.7], [-8.4, 0.2, 8], palette.stoneDark);

  for (let i = 0; i < 5; i += 1) {
    addVoxelBox(scene, [0.5, 0.18, 1.6], [-10.2 + i * 0.95, 0.45 + i * 0.12, 8.9 + i * 1.06], palette.wood, {
      solid: false,
    });
  }
}

function makeGrassTuft(scene, x, z, scale = 1) {
  addVoxelBox(scene, [0.16, 0.55 * scale, 0.16], [x, 0.28 * scale, z], palette.grassDark, {
    solid: false,
    castShadow: false,
  });
  addVoxelBox(scene, [0.16, 0.46 * scale, 0.16], [x + 0.15, 0.23 * scale, z + 0.1], palette.grassLight, {
    solid: false,
    castShadow: false,
  });
  addVoxelBox(scene, [0.16, 0.42 * scale, 0.16], [x - 0.12, 0.21 * scale, z - 0.08], palette.grassDark, {
    solid: false,
    castShadow: false,
  });
}

function createSteppingStones(scene) {
  [
    [7.5, 0.2, 18.8],
    [10.2, 0.24, 20.3],
    [12.7, 0.2, 22.5],
    [-14.3, 0.18, 9.8],
    [-16.1, 0.24, 7.9],
    [-17.4, 0.2, 6.1],
  ].forEach(([x, y, z], index) => {
    addVoxelBox(scene, [1 + (index % 2) * 0.35, 0.18, 0.8], [x, y, z], palette.stoneAccent, {
      solid: false,
      receiveShadow: true,
      rotationY: index % 2 === 0 ? 0.28 : -0.4,
    });
  });
}

function createClimbables(scene) {
  const lowWallColor = "#cdbfad";
  const rockColor = "#b9b0a2";
  const hiddenRouteColor = "#8c6b4f";

  [
    [-18.5, 0.35, 14.4, 2.8, 0.7, 1.4],
    [-15.6, 0.65, 15.7, 2.3, 1.3, 1.4],
    [-12.8, 0.98, 16.9, 2, 1.95, 1.4],
  ].forEach(([x, y, z, sx, sy, sz]) => {
    addVoxelBox(scene, [sx, sy, sz], [x, y, z], lowWallColor, {
      expand: 0.05,
      receiveShadow: true,
    });
  });

  [
    [15.5, 0.28, 18.2, 1.8, 0.56, 1.4],
    [17.6, 0.58, 19.7, 1.65, 1.16, 1.55],
    [19.8, 0.94, 21.5, 1.55, 1.88, 1.6],
  ].forEach(([x, y, z, sx, sy, sz]) => {
    addVoxelBox(scene, [sx, sy, sz], [x, y, z], rockColor, {
      expand: 0.06,
      receiveShadow: true,
    });
  });

  [
    [9.6, 0.25, 8.1, 2.2, 0.5, 1.7],
    [11.6, 0.58, 6.7, 1.8, 1.16, 1.6],
  ].forEach(([x, y, z, sx, sy, sz]) => {
    addVoxelBox(scene, [sx, sy, sz], [x, y, z], lowWallColor, {
      expand: 0.05,
      receiveShadow: true,
    });
  });

  // Hidden route to the roof: starts behind the left bamboo grove and climbs to the side roof.
  [
    [-21.5, 0.28, 7.6, 1.6, 0.56, 1.6, rockColor],
    [-19.7, 0.62, 6.2, 1.5, 1.24, 1.5, rockColor],
    [-17.8, 1.04, 4.9, 1.45, 2.08, 1.45, lowWallColor],
    [-15.9, 1.55, 3.6, 1.35, 3.1, 1.35, lowWallColor],
    [-14.3, 2.2, 2.2, 1.25, 4.4, 1.25, hiddenRouteColor],
    [-12.8, 3.02, 0.8, 1.2, 6.04, 1.2, hiddenRouteColor],
    [-11.3, 4.04, -0.8, 1.2, 8.08, 1.2, hiddenRouteColor],
    [-9.9, 5.2, -2.1, 1.1, 10.4, 1.1, hiddenRouteColor],
    [-8.5, 6.5, -3.1, 1, 13, 1, hiddenRouteColor],
    [-7.25, 7.85, -2.7, 1.2, 15.7, 1.2, hiddenRouteColor],
    [-7.15, 9.0, -1.2, 1.8, 18, 1.8, lowWallColor],
    [-6.4, 10.1, -0.4, 1.4, 0.55, 1.4, lowWallColor],
    [-5.0, 11.0, 0.15, 1.35, 0.55, 1.35, hiddenRouteColor],
    [-3.55, 12.0, 0.55, 1.3, 0.55, 1.3, hiddenRouteColor],
    [-2.0, 13.15, 0.95, 2.6, 0.7, 2.4, lowWallColor],
  ].forEach(([x, y, z, sx, sy, sz, color]) => {
    addVoxelBox(scene, [sx, sy, sz], [x, y, z], color, {
      expand: 0.04,
      receiveShadow: true,
    });
  });

  [
    [-22.7, 9.7],
    [-20.8, 8.1],
    [-18.8, 6.6],
    [-16.9, 5.1],
  ].forEach(([x, z]) => makeLantern(scene, x, 0, z));
}

function createPaths(scene) {
  addVoxelBox(scene, [7, 0.16, 20], [0, 0.08, 23], palette.path, { solid: false, receiveShadow: true });
  addVoxelBox(scene, [14, 0.16, 4.2], [0, 0.08, 11.2], palette.path, { solid: false, receiveShadow: true });
  addVoxelBox(scene, [4.2, 0.16, 6], [-7.8, 0.08, 11.5], palette.path, { solid: false, receiveShadow: true });
}

function createFence(scene, x1, z1, x2, z2) {
  const length = Math.hypot(x2 - x1, z2 - z1);
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;
  const angle = Math.atan2(z2 - z1, x2 - x1);

  addVoxelBox(scene, [length, 0.18, 0.18], [midX, 1.3, midZ], palette.wood, {
    rotationY: -angle,
    solid: false,
  });
  addVoxelBox(scene, [length, 0.18, 0.18], [midX, 0.8, midZ], palette.wood, {
    rotationY: -angle,
    solid: false,
  });

  const postCount = Math.max(2, Math.round(length / 2.2));
  for (let i = 0; i <= postCount; i += 1) {
    const t = i / postCount;
    addVoxelBox(scene, [0.18, 1.4, 0.18], [x1 + (x2 - x1) * t, 0.7, z1 + (z2 - z1) * t], palette.wood, {
      expand: 0.05,
    });
  }
}

function createCloud(scene, x, y, z, blocks) {
  blocks.forEach(([bx, by, bz]) => {
    const mesh = addVoxelBox(scene, [2.2, 0.8, 2.2], [x + bx, y + by, z + bz], "#f6f4ef", {
      solid: false,
      castShadow: false,
      receiveShadow: false,
    });
    driftingClouds.push({
      mesh,
      baseX: x + bx,
      baseZ: z + bz,
      offset: (x + z + bx + bz) * 0.03,
    });
  });
}

function createCat(scene) {
  const cat = new THREE.Group();
  cat.scale.setScalar(0.68);

  const fur = new THREE.MeshLambertMaterial({ color: palette.catFur, flatShading: true });
  const furShadow = new THREE.MeshLambertMaterial({ color: palette.catFurShadow, flatShading: true });
  const face = new THREE.MeshLambertMaterial({ color: palette.catFace, flatShading: true });
  const innerEar = new THREE.MeshLambertMaterial({ color: palette.catInnerEar, flatShading: true });
  const eye = new THREE.MeshLambertMaterial({ color: palette.catEye, flatShading: true });
  const pupil = new THREE.MeshLambertMaterial({ color: palette.catPupil, flatShading: true });
  const nose = new THREE.MeshLambertMaterial({ color: palette.catNose, flatShading: true });
  const whisker = new THREE.MeshLambertMaterial({ color: palette.catWhisker, flatShading: true });
  const boot = new THREE.MeshLambertMaterial({ color: palette.catBoot, flatShading: true });
  const bootCuff = new THREE.MeshLambertMaterial({ color: palette.catBootCuff, flatShading: true });
  const hat = new THREE.MeshLambertMaterial({ color: palette.catHat, flatShading: true });
  const hatBand = new THREE.MeshLambertMaterial({ color: palette.catHatBand, flatShading: true });
  const feather = new THREE.MeshLambertMaterial({ color: palette.catFeather, flatShading: true });
  const sparkle = new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: true });

  const parts = [];
  const addPart = (geometry, material, position, rotation = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    cat.add(mesh);
    parts.push(mesh);
    return mesh;
  };

  addPart(new THREE.BoxGeometry(1.75, 1.02, 2.28), fur, [0, 0.98, 0.02]);
  addPart(new THREE.BoxGeometry(1.4, 0.84, 1.55), furShadow, [0, 1.18, -0.18]);
  addPart(new THREE.BoxGeometry(1.38, 1.2, 1.34), fur, [0, 1.42, 1.34]);
  addPart(new THREE.BoxGeometry(1.16, 0.84, 0.68), face, [0, 1.14, 1.88]);
  addPart(new THREE.BoxGeometry(0.48, 0.34, 0.42), face, [0, 1.01, 2.14]);
  addPart(new THREE.BoxGeometry(0.52, 0.52, 0.3), fur, [-0.54, 1.28, 1.62]);
  addPart(new THREE.BoxGeometry(0.52, 0.52, 0.3), fur, [0.54, 1.28, 1.62]);
  addPart(new THREE.BoxGeometry(0.24, 0.42, 0.24), fur, [-0.38, 1.98, 1.48], [0, 0, -0.18]);
  addPart(new THREE.BoxGeometry(0.24, 0.42, 0.24), fur, [0.38, 1.98, 1.48], [0, 0, 0.18]);
  addPart(new THREE.BoxGeometry(0.13, 0.18, 0.13), innerEar, [-0.38, 1.95, 1.62], [0, 0, -0.18]);
  addPart(new THREE.BoxGeometry(0.13, 0.18, 0.13), innerEar, [0.38, 1.95, 1.62], [0, 0, 0.18]);
  addPart(new THREE.BoxGeometry(0.34, 0.34, 0.1), eye, [-0.28, 1.38, 2.2]);
  addPart(new THREE.BoxGeometry(0.34, 0.34, 0.1), eye, [0.28, 1.38, 2.2]);
  addPart(new THREE.BoxGeometry(0.1, 0.3, 0.05), pupil, [-0.28, 1.38, 2.26]);
  addPart(new THREE.BoxGeometry(0.1, 0.3, 0.05), pupil, [0.28, 1.38, 2.26]);
  addPart(new THREE.BoxGeometry(0.08, 0.08, 0.03), sparkle, [-0.21, 1.47, 2.27]);
  addPart(new THREE.BoxGeometry(0.08, 0.08, 0.03), sparkle, [0.21, 1.47, 2.27]);
  addPart(new THREE.BoxGeometry(0.14, 0.1, 0.08), nose, [0, 1.02, 2.27]);
  addPart(new THREE.BoxGeometry(0.12, 0.32, 0.06), furShadow, [-0.18, 1.64, 2.02], [0, 0, -0.08]);
  addPart(new THREE.BoxGeometry(0.12, 0.32, 0.06), furShadow, [0, 1.7, 2.05]);
  addPart(new THREE.BoxGeometry(0.12, 0.32, 0.06), furShadow, [0.18, 1.64, 2.02], [0, 0, 0.08]);
  addPart(new THREE.BoxGeometry(0.56, 0.1, 0.04), whisker, [-0.52, 1, 2.08], [0, 0.18, 0]);
  addPart(new THREE.BoxGeometry(0.56, 0.1, 0.04), whisker, [0.52, 1, 2.08], [0, -0.18, 0]);
  addPart(new THREE.BoxGeometry(0.82, 0.18, 0.78), face, [0, 0.48, 0.56]);
  addPart(new THREE.BoxGeometry(1.02, 0.12, 1.14), hat, [0, 2.08, 1.28]);
  addPart(new THREE.BoxGeometry(0.72, 0.36, 0.72), hat, [0, 2.3, 1.28]);
  addPart(new THREE.BoxGeometry(0.74, 0.08, 0.74), hatBand, [0, 2.18, 1.28]);
  addPart(new THREE.BoxGeometry(0.12, 0.56, 0.12), feather, [0.34, 2.58, 1.32], [0.12, 0, -0.42]);
  addPart(new THREE.BoxGeometry(0.12, 0.36, 0.12), feather, [0.45, 2.76, 1.36], [0.1, 0.08, -0.72]);

  const legOffsets = [
    [-0.48, 0.33, 0.72],
    [0.48, 0.33, 0.72],
    [-0.48, 0.33, -0.72],
    [0.48, 0.33, -0.72],
  ];
  const legs = legOffsets.map((offset, index) =>
    addPart(new THREE.BoxGeometry(0.38, 0.66, 0.38), index < 2 ? face : furShadow, offset),
  );
  legOffsets.forEach((offset) => {
    addPart(new THREE.BoxGeometry(0.5, 0.28, 0.52), boot, [offset[0], 0.04, offset[2]]);
    addPart(new THREE.BoxGeometry(0.42, 0.14, 0.44), bootCuff, [offset[0], 0.22, offset[2]]);
  });

  const tailBase = new THREE.Group();
  tailBase.position.set(0, 1.18, -1.36);
  cat.add(tailBase);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.02, 0.34), furShadow);
  tail.position.set(0, 0.5, -0.06);
  tail.rotation.x = -0.92;
  tail.castShadow = true;
  tail.receiveShadow = true;
  tailBase.add(tail);
  parts.push(tail);

  cat.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  scene.add(cat);

  return {
    root: cat,
    legs,
    tailBase,
    dispose() {
      parts.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    },
  };
}

function buildWorld(scene) {
  const ground = addVoxelBox(scene, [120, 1, 120], [0, -0.5, 0], palette.grass, {
    solid: false,
    receiveShadow: true,
  });
  ground.material.color.set(palette.grass);

  const edgeGrassOptions = { solid: false, castShadow: false, receiveShadow: true };
  for (let i = -58; i <= 58; i += 4) {
    addVoxelBox(scene, [4, 0.08, 4], [i, 0.04, 54], palette.grassDark, edgeGrassOptions);
    if (i !== 54) {
      addVoxelBox(scene, [4, 0.08, 4], [54, 0.04, i], palette.grassDark, edgeGrassOptions);
    }
  }

  createTemple(scene);
  createGate(scene);
  createPond(scene);
  createPaths(scene);
  createSteppingStones(scene);
  createClimbables(scene);

  [
    [-12, 15, -6, 15],
    [12, 15, 6, 15],
    [-12, 15, -12, 8],
    [12, 15, 12, 8],
  ].forEach(([x1, z1, x2, z2]) => createFence(scene, x1, z1, x2, z2));

  [-10, -5, 9, 13, 18].forEach((x, index) => makeTree(scene, x, -18 - index * 2.5, 1.2));
  [-26, -21, -15, 20, 26].forEach((x, index) => makeTree(scene, x, -8 + index * 4.2, 1.5));
  [-17, -11, 14, 20].forEach((x, index) => makeTree(scene, x, 24 + index * 2.4, 1.1));

  [
    [-14, 6],
    [-11, 18],
    [10, 8],
    [14, 18],
    [5, 22],
  ].forEach(([x, z]) => makeBlossomTree(scene, x, z));

  [
    [-24, 9],
    [-24.5, 11],
    [-25, 13],
    [23, -10],
    [24, -8.5],
    [25, -7],
  ].forEach(([x, z], index) => makeBamboo(scene, x, z, 3.2 + (index % 2) * 0.8));

  [
    [-18, 14],
    [-16, 15.5],
    [-13.6, 16.3],
    [9.8, 24],
    [12.4, 25.2],
    [15, 24.4],
    [18.4, 20.8],
    [-3, 26.3],
    [1, 27.2],
    [-22, -2],
    [22, 4],
    [24, 6],
  ].forEach(([x, z], index) => makeGrassTuft(scene, x, z, 0.9 + (index % 3) * 0.18));

  [
    [-6.8, 2.3, 14],
    [6.8, 2.3, 14],
    [-8.5, 2.3, 2],
    [8.5, 2.3, 2],
  ].forEach(([x, y, z]) => makeLantern(scene, x, y, z));

  createCloud(scene, -18, 28, -12, [
    [0, 0, 0],
    [2, 0.3, 0.8],
    [4, -0.1, 0],
  ]);
  createCloud(scene, 16, 24, -18, [
    [0, 0, 0],
    [2.1, 0.1, -0.2],
    [4.2, 0.2, 0.5],
    [6, 0, 0],
  ]);
  createCloud(scene, 26, 21, 8, [
    [0, 0, 0],
    [2, 0.2, 0.2],
    [4, -0.1, -0.3],
  ]);
}

function clampToGround(position, velocityY) {
  let nextY = position.y + velocityY;
  const eyeHeight = 1.7;
  if (nextY < eyeHeight) {
    nextY = eyeHeight;
  }
  return nextY;
}

function collidesAt(position) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(position.x - 0.45, position.y - 1.62, position.z - 0.45),
    new THREE.Vector3(position.x + 0.45, position.y + 0.2, position.z + 0.45),
  );
  return solidBounds.some((bound) => bound.intersectsBox(playerBox));
}

function getFrontStairSupport(position) {
  const withinX = Math.abs(position.x) <= 4.6;
  const withinZ = position.z >= 7.2 && position.z <= 14.8;
  if (!withinX || !withinZ) {
    return null;
  }

  const topHeight = 2;
  const t = (14.8 - position.z) / (14.8 - 7.2);
  return THREE.MathUtils.clamp(t, 0, 1) * topHeight;
}

function getSupportHeight(position, maxStepUp = 0.62, maxStepDown = 1.2) {
  const feetY = position.y - 1.7;
  const minX = position.x - 0.43;
  const maxX = position.x + 0.43;
  const minZ = position.z - 0.43;
  const maxZ = position.z + 0.43;

  let bestTop = 0;
  let foundSupport = false;

  const stairSupport = getFrontStairSupport(position);
  if (stairSupport !== null) {
    bestTop = stairSupport;
    foundSupport = true;
  }

  solidBounds.forEach((bound) => {
    const overlapsX = bound.min.x < maxX && bound.max.x > minX;
    const overlapsZ = bound.min.z < maxZ && bound.max.z > minZ;
    if (!overlapsX || !overlapsZ) {
      return;
    }

    const top = bound.max.y;
    const withinReach = top <= feetY + maxStepUp && top >= feetY - maxStepDown;
    if (!withinReach) {
      return;
    }

    if (!foundSupport || top > bestTop) {
      bestTop = top;
      foundSupport = true;
    }
  });

  if (foundSupport) {
    return bestTop;
  }

  if (feetY <= maxStepUp && feetY >= -maxStepDown) {
    return 0;
  }

  return null;
}

function tryStepMove(basePosition, deltaVector, maxStepUp = 0.75, maxStepDown = 1.2) {
  const attempted = basePosition.clone().add(deltaVector);
  if (!collidesAt(attempted)) {
    return attempted;
  }

  const supportHeight = getSupportHeight(attempted, maxStepUp, maxStepDown);
  if (supportHeight === null) {
    return null;
  }

  const supported = attempted.clone();
  supported.y = supportHeight + 1.7;
  return collidesAt(supported) ? null : supported;
}

function App() {
  const mountRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    worldObjects.length = 0;
    solidBounds.length = 0;
    animatedWater.length = 0;
    driftingClouds.length = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.skyTop);
    scene.fog = new THREE.Fog(palette.fog, 36, 110);

    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.5, 150);
    camera.position.set(0, 8, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xf5f9ff, 0x7ca06d, 1.45);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff3d6, 1.8);
    sun.position.set(28, 40, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    scene.add(sun);

    const mountainMaterial = new THREE.MeshLambertMaterial({ color: "#c5d8b7", flatShading: true });
    const mountainGeometry = new THREE.ConeGeometry(12, 18, 4);
    [-30, -5, 24].forEach((x, index) => {
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(x, 8, -40 - index * 7);
      mountain.rotation.y = Math.PI / 4;
      mountain.scale.setScalar(1 + index * 0.4);
      mountain.receiveShadow = true;
      scene.add(mountain);
    });

    buildWorld(scene);
    const cat = createCat(scene);
    const catShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 }),
    );
    catShadow.rotation.x = -Math.PI / 2;
    catShadow.position.set(0, 0.04, 34);
    scene.add(catShadow);

    const player = {
      position: new THREE.Vector3(0, 1.7, 34),
      yaw: Math.PI,
      pitch: -0.15,
      velocityY: 0,
      grounded: true,
      jumpLockUntil: 0,
    };

    window.__mindCraftDebug = {
      getPlayerState: () => ({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        grounded: player.grounded,
        velocityY: player.velocityY,
      }),
      setPlayerState: ({ x, y, z, yaw, pitch }) => {
        if (typeof x === "number") player.position.x = x;
        if (typeof y === "number") player.position.y = y;
        if (typeof z === "number") player.position.z = z;
        if (typeof yaw === "number") player.yaw = yaw;
        if (typeof pitch === "number") player.pitch = pitch;
      },
      forceLock: () => {
        pointer.active = true;
      },
    };

    const clock = new THREE.Clock();
    const pointer = { active: false };

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const handleKeyDown = (event) => {
      keyState[event.code] = true;
    };

    const handleKeyUp = (event) => {
      keyState[event.code] = false;
    };

    const handleMouseMove = (event) => {
      if (!pointer.active) {
        return;
      }
      player.yaw -= event.movementX * 0.0024;
      player.pitch -= event.movementY * 0.0019;
      player.pitch = THREE.MathUtils.clamp(player.pitch, -1.1, 0.55);
    };

    const enablePointerLock = () => {
      renderer.domElement.requestPointerLock();
    };

    const handlePointerChange = () => {
      pointer.active = document.pointerLockElement === renderer.domElement;
      setIsLocked(pointer.active);
      if (!pointer.active) {
        Object.keys(keyState).forEach((code) => {
          keyState[code] = false;
        });
      }
      if (pointer.active) {
        setHasEntered(true);
      }
    };

    const tryJump = () => {
      if (player.grounded) {
        const sprintBoost = keyState.ShiftLeft || keyState.ShiftRight ? 0.03 : 0;
        player.velocityY = 0.24 + sprintBoost;
        player.grounded = false;
        player.jumpLockUntil = performance.now() + 220;
      }
    };

    const movePlayer = (delta) => {
      if (!pointer.active) {
        return { moving: false, speed: 0 };
      }

      const moveDirection = new THREE.Vector3();
      const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
      const right = new THREE.Vector3(-Math.cos(player.yaw), 0, Math.sin(player.yaw));

      if (keyState.KeyW) moveDirection.add(forward);
      if (keyState.KeyS) moveDirection.sub(forward);
      if (keyState.KeyD) moveDirection.add(right);
      if (keyState.KeyA) moveDirection.sub(right);

      const speed = keyState.ShiftLeft || keyState.ShiftRight ? 12 : 7;
      const moving = moveDirection.lengthSq() > 0;
      if (moving) {
        moveDirection.normalize().multiplyScalar(speed * delta);
      }

      if (keyState.Space) {
        tryJump();
      }

      if (player.grounded) {
        const movedX = tryStepMove(player.position, new THREE.Vector3(moveDirection.x, 0, 0));
        if (movedX) {
          player.position.copy(movedX);
        }

        const movedZ = tryStepMove(player.position, new THREE.Vector3(0, 0, moveDirection.z));
        if (movedZ) {
          player.position.copy(movedZ);
        }
      } else {
        const airX = player.position.clone().add(new THREE.Vector3(moveDirection.x, 0, 0));
        if (!collidesAt(airX)) {
          player.position.x = airX.x;
        }

        const airZ = player.position.clone().add(new THREE.Vector3(0, 0, moveDirection.z));
        if (!collidesAt(airZ)) {
          player.position.z = airZ.z;
        }
      }

      const supportHeight = getSupportHeight(player.position, 0.62, 0.35);
      const feetY = player.position.y - 1.7;
      const closeToGround = supportHeight !== null && Math.abs(feetY - supportHeight) <= 0.2;
      const jumpLocked = performance.now() < player.jumpLockUntil;
      if (!jumpLocked && player.velocityY <= 0 && closeToGround) {
        player.position.y = supportHeight + 1.7;
        player.velocityY = 0;
        player.grounded = true;
      } else {
        player.grounded = false;
      }

      if (!player.grounded) {
        player.velocityY -= 0.27 * delta;
        const nextVertical = player.position.clone();
        nextVertical.y = clampToGround(player.position, player.velocityY);

        if (nextVertical.y <= 1.7) {
          player.position.y = 1.7;
          player.velocityY = 0;
          player.grounded = true;
        } else if (!collidesAt(nextVertical)) {
          player.position.y = nextVertical.y;
        } else {
          player.velocityY = 0;
        }
      }

      player.position.x = THREE.MathUtils.clamp(player.position.x, -55, 55);
      player.position.z = THREE.MathUtils.clamp(player.position.z, -55, 55);

      return { moving, speed };
    };

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.03);
      const { moving, speed } = movePlayer(delta * 5);
      const time = performance.now() * 0.001;

      cat.root.position.set(player.position.x, player.position.y - 1.7, player.position.z);
      cat.root.rotation.y = player.yaw;

      const stride = moving ? performance.now() * 0.012 * (speed / 7) : 0;
      cat.legs.forEach((leg, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        leg.rotation.x = moving ? Math.sin(stride) * 0.45 * direction : 0;
      });
      cat.tailBase.rotation.x = moving ? -0.35 + Math.sin(stride * 0.7) * 0.18 : -0.28;
      cat.root.position.y += moving ? Math.abs(Math.sin(stride)) * 0.06 : Math.sin(time * 2.2) * 0.028;
      catShadow.position.set(player.position.x, 0.04, player.position.z);
      const shadowPulse = moving ? 0.9 + Math.abs(Math.sin(stride)) * 0.08 : 0.92 + Math.sin(time * 2.2) * 0.02;
      catShadow.scale.set(shadowPulse, shadowPulse * 0.82, 1);

      animatedWater.forEach((surface) => {
        surface.mesh.position.y = surface.baseY + Math.sin(time * 1.8 + surface.phase) * 0.04;
      });
      driftingClouds.forEach((cloud) => {
        cloud.mesh.position.x = cloud.baseX + Math.sin(time * 0.11 + cloud.offset) * 1.4;
        cloud.mesh.position.z = cloud.baseZ + Math.cos(time * 0.09 + cloud.offset) * 0.45;
      });

      const followOffset = new THREE.Vector3(0, 3.2, -6.2)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch * 0.18);
      const desiredCamera = player.position.clone().add(followOffset);
      camera.position.lerp(desiredCamera, 0.14);
      camera.lookAt(player.position.x, player.position.y + 1.1, player.position.z);
      const targetFov = moving && speed > 7 ? 78 : 72;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerChange);
    renderer.domElement.addEventListener("click", enablePointerLock);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerChange);
      renderer.domElement.removeEventListener("click", enablePointerLock);
      mount.removeChild(renderer.domElement);
      worldObjects.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      cat.dispose();
      catShadow.geometry.dispose();
      catShadow.material.dispose();
      delete window.__mindCraftDebug;
      renderer.dispose();
    };
  }, []);

  return (
    <div className="app-shell">
      <div className="hero-copy">
        <p className="eyebrow">Playable Voxel World</p>
        <h1>MindCraft Temple</h1>
        <p className="description">
          마인크래프트 감성의 사원 월드를 브라우저 안에 구현했습니다. 클릭해서 시점을 고정한 뒤
          `WASD`로 이동하고, `Shift`로 질주하고, `Space`로 점프해보세요.
        </p>
      </div>

      <div className="viewport-card">
        <div ref={mountRef} className="viewport" />
        <div className={`focus-overlay${isLocked ? " is-hidden" : ""}`}>
          <p className="focus-kicker">{hasEntered ? "Paused View" : "Click To Enter"}</p>
          <h2>{hasEntered ? "Press Back In To Continue" : "Guide The British Shorthair"}</h2>
          <p>
            {hasEntered
              ? "ESC로 시점 고정을 풀었습니다. 화면을 다시 클릭하면 탐험을 이어갈 수 있어요."
              : "시점을 고정하면 부드러운 3인칭 카메라로 사원 정원을 자유롭게 뛰어다닐 수 있습니다."}
          </p>
        </div>
        <div className="hud hud-left">
          <span>MOVE: WASD</span>
          <span>SPRINT: SHIFT</span>
          <span>JUMP: SPACE</span>
        </div>
        <div className="status-bar">
          <span className={`status-pill${isLocked ? " is-live" : ""}`}>{isLocked ? "LIVE CAMERA" : "CLICK TO PLAY"}</span>
          <span className="status-pill subtle">ESC TO RELEASE</span>
        </div>
        <div className={`crosshair${isLocked ? " is-visible" : ""}`} aria-hidden="true" />
      </div>
    </div>
  );
}

export default App;
