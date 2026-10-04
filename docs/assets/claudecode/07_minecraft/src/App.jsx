import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const keyState = {};
const worldObjects = [];
const solidBounds = [];
const animatedWater = [];
const driftingClouds = [];
const lanternLights = [];
const textureCache = new Map();
const materialCache = new Map();

const palette = {
  skyTop: "#2c4a86",
  skyHorizon: "#ffc48a",
  skyGround: "#b98667",
  sun: "#ffb35c",
  fog: "#f0bf92",
  grass: "#8fbf62",
  grassDark: "#6e9f4a",
  grassLight: "#b3d77f",
  dirt: "#7d5c42",
  stone: "#e4dccb",
  stoneDark: "#c4b9a3",
  stoneAccent: "#b6ab98",
  roof: "#2f3340",
  roofAccent: "#464b5c",
  gold: "#e2b350",
  wood: "#7a5536",
  pillar: "#b2352a",
  beam: "#e3cfa2",
  water: "#4fb3d9",
  waterDeep: "#2b7fb3",
  leaf: "#7fb357",
  leafDark: "#5f9442",
  bamboo: "#86c45f",
  blossom: "#f7a9c2",
  blossomLight: "#ffd2e1",
  trunk: "#4a2f1d",
  lantern: "#ffd27a",
  path: "#cdbb9f",
  mountain: "#7d8f86",
  cloud: "#fff1e2",
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
};

// 색마다 어떤 픽셀 질감을 입힐지 정한다. 목록에 없는 색은 잔잔한 노이즈를 쓴다.
const textureByColor = {
  [palette.stone]: "brick",
  [palette.stoneDark]: "brick",
  [palette.stoneAccent]: "brick",
  [palette.roof]: "tile",
  [palette.roofAccent]: "tile",
  [palette.wood]: "plank",
  [palette.pillar]: "plank",
  [palette.beam]: "plank",
  [palette.trunk]: "bark",
  [palette.leaf]: "leaf",
  [palette.leafDark]: "leaf",
  [palette.blossom]: "leaf",
  [palette.blossomLight]: "leaf",
  [palette.grass]: "grass",
  [palette.grassDark]: "grass",
  [palette.grassLight]: "grass",
  [palette.mountain]: "grass",
};

const ORB_SPOTS = [
  { position: [0, 1.4, 22], label: "참배길" },
  { position: [-7.6, 1.3, 11.2], label: "연못" },
  { position: [-12.8, 3, 16.9], label: "서쪽 돌담 위" },
  { position: [19.8, 2.95, 21.5], label: "동쪽 바위 위" },
  { position: [2, 1.4, -24], label: "뒤뜰 숲" },
  { position: [21, 1.4, -8.6], label: "대나무 숲" },
  { position: [0, 4.3, 0.6], label: "사원 제단", hint: "마지막 구슬은 사원 안 제단에 있습니다. 정면 계단으로 올라가세요." },
];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getPixelTexture(kind) {
  if (textureCache.has(kind)) {
    return textureCache.get(kind);
  }
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);
  const rand = mulberry32(kind.length * 7919 + kind.charCodeAt(0));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let v = 0.88 + rand() * 0.12;
      if (kind === "brick") {
        const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 4;
        if (y % 4 === 3 || (x + offset) % 8 === 7) v = 0.7;
      } else if (kind === "plank") {
        if (y % 4 === 3) v = 0.68;
        else if ((x * 3 + y * 5) % 11 === 0) v -= 0.08;
      } else if (kind === "tile") {
        const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 2;
        if (y % 4 === 3) v = 0.58;
        else if ((x + offset) % 4 === 0) v -= 0.1;
        else if (y % 4 === 0) v += 0.06;
      } else if (kind === "bark") {
        v = 0.78 + rand() * 0.16;
        if (x % 4 === 1) v -= 0.14;
      } else if (kind === "leaf") {
        v = 0.66 + rand() * 0.34;
        if (rand() < 0.12) v = 0.5;
      } else if (kind === "grass") {
        v = 0.8 + rand() * 0.2;
        if (rand() < 0.05) v = 1;
      }
      const c = Math.round(Math.min(1, v) * 255);
      const i = (y * size + x) * 4;
      image.data[i] = c;
      image.data[i + 1] = c;
      image.data[i + 2] = c;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  textureCache.set(kind, texture);
  return texture;
}

function getGlowTexture() {
  if (textureCache.has("glow")) {
    return textureCache.get("glow");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set("glow", texture);
  return texture;
}

function getBeamTexture() {
  if (textureCache.has("beam")) {
    return textureCache.get("beam");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 128, 0, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set("beam", texture);
  return texture;
}

function getBlockMaterial(color, options = {}) {
  const tex = options.tex === undefined ? textureByColor[color] ?? "noise" : options.tex;
  const key = `${color}|${tex}|${options.emissive ?? ""}|${options.emissiveIntensity ?? ""}`;
  if (materialCache.has(key)) {
    return materialCache.get(key);
  }
  const material = new THREE.MeshStandardMaterial({
    color,
    map: tex ? getPixelTexture(tex) : null,
    roughness: options.roughness ?? 0.88,
    metalness: options.metalness ?? 0,
    flatShading: true,
  });
  if (options.emissive) {
    material.emissive = new THREE.Color(options.emissive);
    material.emissiveIntensity = options.emissiveIntensity ?? 1;
  }
  materialCache.set(key, material);
  return material;
}

// 상자 크기에 맞춰 UV를 늘려, 큰 블록이든 작은 블록이든 1칸에 16픽셀 밀도를 유지한다.
function applyWorldUVs(geometry, [sx, sy, sz]) {
  const uv = geometry.attributes.uv;
  const faceDims = [
    [sz, sy],
    [sz, sy],
    [sx, sz],
    [sx, sz],
    [sx, sy],
    [sx, sy],
  ];
  for (let face = 0; face < 6; face += 1) {
    for (let i = 0; i < 4; i += 1) {
      const index = face * 4 + i;
      uv.setXY(index, uv.getX(index) * faceDims[face][0], uv.getY(index) * faceDims[face][1]);
    }
  }
  uv.needsUpdate = true;
}

function addVoxelBox(scene, size, position, color, options = {}) {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  applyWorldUVs(geometry, size);
  const material = options.material ?? getBlockMaterial(color, options);
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
  addVoxelBox(scene, [1.1, 0.9, 1.1], [x - 0.6, 3.8, z + 0.4], palette.blossomLight, {
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
    tex: null,
    emissive: "#ffb347",
    emissiveIntensity: 3.2,
  });
  addVoxelBox(scene, [0.6, 0.12, 0.6], [x, y + 1.72, z], palette.roof, { solid: false, castShadow: false });
  const glow = new THREE.PointLight(0xffb45e, 7, 9, 2);
  glow.position.set(x, y + 1.45, z);
  scene.add(glow);
  lanternLights.push(glow);
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
    addVoxelBox(scene, [1, 0.3, 1], [i * 1.7, 2.95, 5.4], palette.gold, { solid: false, tex: "noise", roughness: 0.4, metalness: 0.6 });
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

  // 처마 끝을 들어 올리고 금색 장식을 얹어 지붕 실루엣을 살린다.
  const goldTrim = { solid: false, tex: "noise", roughness: 0.35, metalness: 0.65 };
  [
    [7.9, 9.55, 6.4, 0.7],
    [5.4, 13.8, 3.25, 0.55],
    [2.35, 18.4, 2, 0.45],
  ].forEach(([hx, y, hz, s]) => {
    [-1, 1].forEach((sx) => {
      [-1, 1].forEach((sz) => {
        addVoxelBox(scene, [s, s * 0.7, s], [sx * hx, y, 0.8 + sz * hz], palette.roof, { solid: false });
        addVoxelBox(scene, [s * 0.5, s * 0.5, s * 0.5], [sx * (hx + 0.1), y + s * 0.55, 0.8 + sz * (hz + 0.1)], palette.gold, goldTrim);
      });
    });
  });
  addVoxelBox(scene, [0.5, 1.4, 0.5], [0, 19.0, 0.8], palette.gold, goldTrim);
  addVoxelBox(scene, [0.9, 0.3, 0.9], [0, 19.55, 0.8], palette.gold, goldTrim);
  addVoxelBox(scene, [10.2, 0.16, 0.16], [0, 13.2, 4.08], palette.gold, goldTrim);
  addVoxelBox(scene, [15, 0.16, 0.16], [0, 9.0, 7.25], palette.gold, goldTrim);
  addVoxelBox(scene, [2.4, 1.1, 0.2], [0, 10.6, 3.35], palette.roof, { solid: false });
  addVoxelBox(scene, [2.0, 0.75, 0.22], [0, 10.6, 3.36], palette.gold, goldTrim);

  addVoxelBox(scene, [3.1, 2.8, 0.6], [-4.45, 4.3, 5.5], palette.wood);
  addVoxelBox(scene, [3.1, 2.8, 0.6], [4.45, 4.3, 5.5], palette.wood);
  addVoxelBox(scene, [2.2, 0.55, 0.6], [0, 5.45, 5.5], palette.beam, { solid: false });
  addVoxelBox(scene, [11.6, 2.8, 0.6], [0, 4.3, -3.8], palette.wood);
  addVoxelBox(scene, [0.6, 2.8, 8.4], [-6, 4.3, 0.2], palette.wood);
  addVoxelBox(scene, [0.6, 2.8, 8.4], [6, 4.3, 0.2], palette.wood);

  // 제단. 마지막 구슬이 놓이는 자리다.
  addVoxelBox(scene, [1.6, 0.7, 1.2], [0, 3.15, 0.6], palette.stoneDark, { solid: false });
  addVoxelBox(scene, [1.8, 0.14, 1.4], [0, 3.55, 0.6], palette.gold, goldTrim);

  for (let i = -3; i <= 3; i += 2) {
    addVoxelBox(scene, [0.9, 0.25, 0.25], [i * 1.7, 6.3, 5.4], palette.beam, { solid: false });
    addVoxelBox(scene, [0.9, 0.25, 0.25], [i * 1.7, 6.3, -3.8], palette.beam, { solid: false });
  }

  addVoxelBox(scene, [8.9, 0.8, 1.6], [0, 2.4, 6.4], palette.stone, { solid: false });
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
  addVoxelBox(scene, [8.6, 0.6, 1.6], [0, 4.6, 16], palette.roof);
  addVoxelBox(scene, [9.4, 0.3, 1.2], [0, 5.0, 16], palette.roof, { solid: false });
  addVoxelBox(scene, [6.4, 0.4, 0.8], [0, 3.6, 16], palette.pillar, { solid: false });
  addVoxelBox(scene, [0.8, 4.6, 0.8], [-2.6, 2.3, 16], palette.pillar);
  addVoxelBox(scene, [0.8, 4.6, 0.8], [2.6, 2.3, 16], palette.pillar);
  addVoxelBox(scene, [1.1, 0.4, 1.1], [-2.6, 0.2, 16], palette.roof, { solid: false });
  addVoxelBox(scene, [1.1, 0.4, 1.1], [2.6, 0.2, 16], palette.roof, { solid: false });
  addVoxelBox(scene, [0.9, 0.9, 0.2], [0, 4.1, 16.45], palette.gold, { solid: false, tex: "noise", roughness: 0.35, metalness: 0.65 });
}

function createPond(scene) {
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: palette.water,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.86,
  });
  const deepMaterial = new THREE.MeshStandardMaterial({
    color: palette.waterDeep,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  materialCache.set("water", waterMaterial);
  materialCache.set("waterDeep", deepMaterial);
  const pondTop = addVoxelBox(scene, [5.2, 0.3, 5.2], [-7.8, 0.15, 11], palette.water, { solid: false, receiveShadow: true, material: waterMaterial });
  const pondDeep = addVoxelBox(scene, [3.5, 0.25, 3.5], [-7.2, 0.12, 11.4], palette.waterDeep, { solid: false, receiveShadow: true, material: deepMaterial });
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

  // 수련 잎
  [
    [-8.8, 10.2],
    [-6.6, 12.4],
    [-7.9, 12.9],
  ].forEach(([x, z]) => {
    addVoxelBox(scene, [0.6, 0.05, 0.6], [x, 0.33, z], palette.leafDark, { solid: false, castShadow: false });
  });
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
  const lowWallColor = palette.stoneDark;
  const rockColor = palette.stoneAccent;
  const hiddenRouteColor = palette.wood;

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
  for (let z = 14; z <= 32; z += 2) {
    addVoxelBox(scene, [0.4, 0.2, 0.4], [-3.7, 0.1, z], palette.stoneAccent, { solid: false, castShadow: false });
    addVoxelBox(scene, [0.4, 0.2, 0.4], [3.7, 0.1, z], palette.stoneAccent, { solid: false, castShadow: false });
  }
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
    const mesh = addVoxelBox(scene, [3.2, 1, 3.2], [x + bx, y + by, z + bz], palette.cloud, {
      solid: false,
      castShadow: false,
      receiveShadow: false,
      tex: null,
      emissive: "#ffb98a",
      emissiveIntensity: 0.35,
    });
    driftingClouds.push({
      mesh,
      baseX: x + bx,
      baseZ: z + bz,
      offset: (x + z + bx + bz) * 0.03,
    });
  });
}

function createMountains(scene) {
  const rand = mulberry32(42);
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2 + rand() * 0.2;
    const radius = 88 + rand() * 22;
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius;
    const base = 22 + rand() * 18;
    const levels = 4 + Math.floor(rand() * 3);
    const stepHeight = 4 + rand() * 3;
    for (let level = 0; level < levels; level += 1) {
      const size = base * (1 - level / (levels + 0.6));
      addVoxelBox(scene, [size, stepHeight, size], [x, stepHeight * (level + 0.5) - 1, z], palette.mountain, {
        solid: false,
        castShadow: false,
        receiveShadow: false,
        rotationY: angle,
      });
    }
  }
}

function createForestRing(scene) {
  const rand = mulberry32(7);
  for (let i = 0; i < 46; i += 1) {
    const angle = rand() * Math.PI * 2;
    const radius = 34 + rand() * 20;
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius;
    // 시작 지점 뒤쪽 시야를 막지 않도록 정면 참배길 쪽은 비워 둔다.
    if (z > 18 && Math.abs(x) < 16) continue;
    if (rand() < 0.22) {
      makeBlossomTree(scene, x, z);
    } else {
      makeTree(scene, x, z, 1 + rand() * 0.7);
    }
  }
}

function createGroundPatches(scene) {
  const rand = mulberry32(19);
  for (let i = 0; i < 40; i += 1) {
    const x = (rand() - 0.5) * 100;
    const z = (rand() - 0.5) * 100;
    if (Math.abs(x) < 13 && z > -11 && z < 34) continue;
    const size = 2 + Math.floor(rand() * 4);
    addVoxelBox(scene, [size, 0.04, size], [Math.round(x), 0.02, Math.round(z)], rand() > 0.5 ? palette.grassDark : palette.grassLight, {
      solid: false,
      castShadow: false,
    });
  }
}

function createCat(scene) {
  const cat = new THREE.Group();
  cat.scale.setScalar(0.68);

  const make = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
  const fur = make(palette.catFur);
  const furShadow = make(palette.catFurShadow);
  const face = make(palette.catFace);
  const innerEar = make(palette.catInnerEar);
  const eye = make(palette.catEye, { emissive: palette.catEye, emissiveIntensity: 0.3 });
  const pupil = make(palette.catPupil);
  const nose = make(palette.catNose);
  const whisker = make(palette.catWhisker);
  const boot = make(palette.catBoot, { roughness: 0.6 });
  const bootCuff = make(palette.catBootCuff, { roughness: 0.4, metalness: 0.4 });
  const hat = make(palette.catHat);
  const hatBand = make(palette.catHatBand, { roughness: 0.35, metalness: 0.6 });
  const feather = make(palette.catFeather);
  const sparkle = make("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.8 });
  const materials = [fur, furShadow, face, innerEar, eye, pupil, nose, whisker, boot, bootCuff, hat, hatBand, feather, sparkle];

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

  scene.add(cat);

  return {
    root: cat,
    legs,
    tailBase,
    dispose() {
      parts.forEach((mesh) => mesh.geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

function createSky(scene, sunDirection) {
  const uniforms = {
    topColor: { value: new THREE.Color(palette.skyTop) },
    horizonColor: { value: new THREE.Color(palette.skyHorizon) },
    groundColor: { value: new THREE.Color(palette.skyGround) },
    sunColor: { value: new THREE.Color(palette.sun) },
    sunDirection: { value: sunDirection.clone().normalize() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 groundColor;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(horizonColor, topColor, pow(smoothstep(-0.02, 0.62, h), 0.75));
        col = mix(col, groundColor, smoothstep(0.0, -0.3, h));
        float s = max(dot(d, sunDirection), 0.0);
        col += sunColor * (pow(s, 6.0) * 0.45 + pow(s, 48.0) * 0.9);
        col += vec3(1.0, 0.86, 0.62) * smoothstep(0.9975, 0.999, s) * 8.0;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const geometry = new THREE.SphereGeometry(200, 32, 16);
  const sky = new THREE.Mesh(geometry, material);
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky);
  return sky;
}

function createFireflies(scene) {
  const count = 90;
  const rand = mulberry32(11);
  const positions = new Float32Array(count * 3);
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    const nearPond = i < 30;
    const x = nearPond ? -7.8 + (rand() - 0.5) * 12 : (rand() - 0.5) * 70;
    const z = nearPond ? 11 + (rand() - 0.5) * 12 : (rand() - 0.5) * 70;
    const y = 0.6 + rand() * 3.4;
    seeds.push({ x, y, z, phase: rand() * Math.PI * 2, speed: 0.4 + rand() * 0.6 });
    positions.set([x, y, z], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.32,
    map: getGlowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color(3.2, 2.4, 0.9),
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return {
    update(time) {
      const attr = geometry.attributes.position;
      seeds.forEach((seed, i) => {
        const t = time * seed.speed + seed.phase;
        attr.setXYZ(i, seed.x + Math.sin(t) * 1.2, seed.y + Math.sin(t * 1.7) * 0.45, seed.z + Math.cos(t * 0.8) * 1.2);
      });
      attr.needsUpdate = true;
      material.opacity = 0.75 + Math.sin(time * 3) * 0.15;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createPetals(scene) {
  const sources = [
    [-14, 6],
    [-11, 18],
    [10, 8],
    [14, 18],
    [5, 22],
  ];
  const count = 140;
  const rand = mulberry32(23);
  const positions = new Float32Array(count * 3);
  const petals = [];
  const respawn = (petal, initial) => {
    const [sx, sz] = sources[Math.floor(rand() * sources.length)];
    petal.x = sx + (rand() - 0.5) * 3;
    petal.z = sz + (rand() - 0.5) * 3;
    petal.y = initial ? rand() * 4 : 3.4 + rand() * 0.8;
    petal.fall = 0.35 + rand() * 0.4;
    petal.phase = rand() * Math.PI * 2;
  };
  for (let i = 0; i < count; i += 1) {
    const petal = {};
    respawn(petal, true);
    petals.push(petal);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ size: 0.11, color: "#ffc3d6", transparent: true, opacity: 0.95 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return {
    update(time, delta) {
      const attr = geometry.attributes.position;
      petals.forEach((petal, i) => {
        petal.y -= petal.fall * delta;
        petal.x += Math.sin(time * 1.3 + petal.phase) * 0.6 * delta + 0.25 * delta;
        petal.z += Math.cos(time * 0.9 + petal.phase) * 0.4 * delta;
        if (petal.y < 0.05) respawn(petal, false);
        attr.setXYZ(i, petal.x, petal.y, petal.z);
      });
      attr.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createOrbs(scene) {
  const coreGeometry = new THREE.OctahedronGeometry(0.34, 0);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#fff1c9",
    emissive: "#ffc861",
    emissiveIntensity: 4.5,
    roughness: 0.3,
    flatShading: true,
  });
  const frameGeometry = new THREE.BoxGeometry(0.62, 0.62, 0.62);
  const frameMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.7), wireframe: true, transparent: true, opacity: 0.7 });
  const beamGeometry = new THREE.CylinderGeometry(0.07, 0.07, 26, 6, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    map: getBeamTexture(),
    color: new THREE.Color(1.3, 0.85, 0.35),
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  const haloMaterials = [];

  const orbs = ORB_SPOTS.map((spot, index) => {
    const group = new THREE.Group();
    group.position.set(...spot.position);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    const haloMaterial = new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: "#ffc66b",
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    haloMaterials.push(haloMaterial);
    const halo = new THREE.Sprite(haloMaterial);
    halo.scale.setScalar(2.6);
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = 13;
    group.add(core, frame, halo, beam);
    scene.add(group);
    return { ...spot, index, group, core, frame, halo, beam, collected: false, collectT: -1 };
  });

  return {
    orbs,
    update(time, delta) {
      orbs.forEach((orb) => {
        if (orb.collected && orb.collectT < 0) return;
        const bob = Math.sin(time * 2 + orb.index) * 0.16;
        orb.group.position.y = orb.position[1] + bob;
        orb.core.rotation.y = time * 1.4 + orb.index;
        orb.frame.rotation.set(time * 0.6, time * 0.9 + orb.index, time * 0.4);
        orb.halo.material.opacity = 0.7 + Math.sin(time * 4 + orb.index) * 0.15;
        if (orb.collectT >= 0) {
          orb.collectT += delta;
          const t = Math.min(orb.collectT / 0.55, 1);
          const ease = 1 - (1 - t) ** 3;
          orb.group.position.y = orb.position[1] + bob + ease * 1.4;
          orb.core.scale.setScalar(1 - ease);
          orb.frame.scale.setScalar(1 + ease * 2.2);
          orb.halo.scale.setScalar(2.6 + ease * 5);
          orb.halo.material.opacity = 1 - ease;
          orb.frame.material.opacity = 0.7 * (1 - ease);
          orb.beam.visible = false;
          if (t >= 1) {
            orb.group.visible = false;
            orb.collectT = -1;
          }
        }
      });
    },
    reset() {
      orbs.forEach((orb) => {
        orb.collected = false;
        orb.collectT = -1;
        orb.group.visible = true;
        orb.beam.visible = true;
        orb.core.scale.setScalar(1);
        orb.frame.scale.setScalar(1);
        orb.halo.scale.setScalar(2.6);
      });
      frameMaterial.opacity = 0.7;
    },
    dispose() {
      coreGeometry.dispose();
      coreMaterial.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      beamGeometry.dispose();
      beamMaterial.dispose();
      haloMaterials.forEach((material) => material.dispose());
    },
  };
}

// 움직이지 않는 블록 수백 개를 재질별로 하나의 메시로 합쳐 드로우 콜을 줄인다.
function mergeStaticMeshes(scene) {
  const dynamic = new Set([...animatedWater.map((item) => item.mesh), ...driftingClouds.map((item) => item.mesh)]);
  const groups = new Map();
  worldObjects.forEach((mesh) => {
    if (dynamic.has(mesh)) return;
    const key = `${mesh.material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  });

  const merged = [];
  groups.forEach((meshes) => {
    const geometries = meshes.map((mesh) => {
      mesh.updateMatrixWorld(true);
      return mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    });
    const mesh = new THREE.Mesh(mergeGeometries(geometries, false), meshes[0].material);
    mesh.castShadow = meshes[0].castShadow;
    mesh.receiveShadow = meshes[0].receiveShadow;
    geometries.forEach((geometry) => geometry.dispose());
    meshes.forEach((source) => {
      scene.remove(source);
      source.geometry.dispose();
    });
    scene.add(mesh);
    merged.push(mesh);
  });

  worldObjects.length = 0;
  worldObjects.push(...merged, ...dynamic);
}

const FIREWORK_COLORS = [
  [1, 0.55, 0.12],
  [1, 0.2, 0.45],
  [0.2, 0.55, 1],
  [1, 0.82, 0.35],
  [0.45, 1, 0.3],
  [0.75, 0.35, 1],
];

// 클리어 축하용 불꽃놀이. 입자 풀 하나를 돌려 쓰고, 로켓은 꼬리 불티를 남기며 올라가 터진다.
function createFireworks(scene) {
  const max = 2400;
  const rand = mulberry32(97);
  const positions = new Float32Array(max * 3).fill(-9999);
  const colors = new Float32Array(max * 3);
  const particles = Array.from({ length: max }, () => ({ vx: 0, vy: 0, vz: 0, age: 0, life: 0, r: 0, g: 0, b: 0, drag: 1.2, gravity: 5 }));
  const rockets = [];
  let cursor = 0;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.95,
    map: getGlowTexture(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const emit = (x, y, z, vx, vy, vz, color, life, intensity = 3, drag = 1.2, gravity = 5) => {
    const index = cursor;
    cursor = (cursor + 1) % max;
    const p = particles[index];
    Object.assign(p, { vx, vy, vz, age: 0, life, drag, gravity, r: color[0] * intensity, g: color[1] * intensity, b: color[2] * intensity });
    positions.set([x, y, z], index * 3);
  };

  const burst = (x, y, z, color, count = 110, speed = 9) => {
    for (let i = 0; i < count; i += 1) {
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const s = speed * (0.75 + rand() * 0.25);
      const tint = rand() < 0.1 ? [1, 0.9, 0.7] : color;
      emit(x, y, z, r * Math.cos(theta) * s, u * s, r * Math.sin(theta) * s, tint, 1.4 + rand() * 0.9);
    }
  };

  return {
    launch(x, z, height, color) {
      rockets.push({ x, y: 0.5, z, vy: 22 + rand() * 4, height, color, sway: rand() * Math.PI * 2 });
    },
    burst,
    sparkle(x, y, z, count = 60) {
      for (let i = 0; i < count; i += 1) {
        const angle = rand() * Math.PI * 2;
        const s = 1.5 + rand() * 2.5;
        emit(x, y, z, Math.cos(angle) * s, 3 + rand() * 5, Math.sin(angle) * s, FIREWORK_COLORS[3], 1 + rand() * 0.6, 1.2, 1.5, 3);
      }
    },
    randomColor() {
      return FIREWORK_COLORS[Math.floor(rand() * FIREWORK_COLORS.length)];
    },
    random: rand,
    update(dt, onBurst) {
      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rocket = rockets[i];
        rocket.y += rocket.vy * dt;
        rocket.sway += dt * 9;
        emit(rocket.x + Math.sin(rocket.sway) * 0.08, rocket.y, rocket.z, 0, -1.5, 0, [1, 0.8, 0.5], 0.45, 2.2, 2, 0);
        if (rocket.y >= rocket.height) {
          burst(rocket.x, rocket.y, rocket.z, rocket.color);
          onBurst?.(rocket);
          rockets.splice(i, 1);
        }
      }
      for (let i = 0; i < max; i += 1) {
        const p = particles[i];
        if (p.life <= 0) continue;
        p.age += dt;
        const k = i * 3;
        if (p.age >= p.life) {
          p.life = 0;
          positions[k + 1] = -9999;
          colors[k] = colors[k + 1] = colors[k + 2] = 0;
          continue;
        }
        const damping = Math.max(0, 1 - p.drag * dt);
        p.vx *= damping;
        p.vy = p.vy * damping - p.gravity * dt;
        p.vz *= damping;
        positions[k] += p.vx * dt;
        positions[k + 1] += p.vy * dt;
        positions[k + 2] += p.vz * dt;
        const fade = 1 - p.age / p.life;
        const twinkle = 0.75 + 0.25 * Math.sin(p.age * 30 + i);
        colors[k] = p.r * fade * twinkle;
        colors[k + 1] = p.g * fade * twinkle;
        colors[k + 2] = p.b * fade * twinkle;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    },
    clear() {
      rockets.length = 0;
      particles.forEach((p) => {
        p.life = 0;
      });
      positions.fill(-9999);
      colors.fill(0);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function buildWorld(scene) {
  addVoxelBox(scene, [300, 1, 300], [0, -0.5, 0], palette.grass, {
    solid: false,
    receiveShadow: true,
    castShadow: false,
  });

  createGroundPatches(scene);
  createTemple(scene);
  createGate(scene);
  createPond(scene);
  createPaths(scene);
  createSteppingStones(scene);
  createClimbables(scene);
  createMountains(scene);
  createForestRing(scene);

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
    [24.2, -11.4],
    [25.6, -9.6],
  ].forEach(([x, z], index) => makeBamboo(scene, x, z, 3.2 + (index % 3) * 0.8));

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

  createCloud(scene, -24, 30, -30, [
    [0, 0, 0],
    [3, 0.4, 1],
    [6, -0.1, 0],
    [3, 1, -1],
  ]);
  createCloud(scene, 18, 26, -36, [
    [0, 0, 0],
    [3.1, 0.1, -0.2],
    [6.2, 0.3, 0.6],
    [9, 0, 0],
  ]);
  createCloud(scene, 34, 22, 6, [
    [0, 0, 0],
    [3, 0.3, 0.3],
    [6, -0.1, -0.4],
  ]);
  createCloud(scene, -40, 24, 10, [
    [0, 0, 0],
    [3, 0.2, 0.8],
  ]);

  mergeStaticMeshes(scene);
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
  const withinZ = position.z >= 5.6 && position.z <= 14.8;
  if (!withinX || !withinZ) {
    return null;
  }

  // 계단 맨 윗단에서 사원 바닥(2.8)까지 이어지도록 경사를 잡는다.
  const topHeight = 2.8;
  const t = (14.8 - position.z) / (14.8 - 6.4);
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

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createSound() {
  let ctx = null;
  let muted = false;
  const tone = (freq, at, length = 0.9, gain = 0.09) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, at);
    amp.gain.linearRampToValueAtTime(gain, at + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(amp).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + length + 0.05);
  };
  return {
    unlock() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) ctx = new AudioCtx();
      }
      if (ctx?.state === "suspended") ctx.resume();
    },
    play(notes) {
      if (muted || !ctx) return;
      const now = ctx.currentTime;
      notes.forEach(([freq, offset, length, gain]) => tone(freq, now + offset, length, gain));
    },
    // 불꽃이 터지는 소리. 짧은 잡음을 저역 필터에 통과시킨다.
    pop(gain = 0.18) {
      if (muted || !ctx) return;
      const now = ctx.currentTime;
      const length = 0.6;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * length), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900 + Math.random() * 900;
      const amp = ctx.createGain();
      amp.gain.value = gain;
      source.connect(filter).connect(amp).connect(ctx.destination);
      source.start(now);
    },
    toggle() {
      muted = !muted;
      return muted;
    },
    close() {
      ctx?.close();
    },
  };
}

const COMPASS_PX_PER_DEG = 2.6;
const COMPASS_LABELS = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
const COMPASS_TICKS = [];
for (let deg = -180; deg <= 540; deg += 15) {
  COMPASS_TICKS.push(deg);
}

function App() {
  const mountRef = useRef(null);
  const compassRef = useRef(null);
  const compassStripRef = useRef(null);
  const compassOrbRef = useRef(null);
  const distanceRef = useRef(null);
  const timerRef = useRef(null);
  const controlsRef = useRef({});
  const [isLocked, setIsLocked] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [collected, setCollected] = useState(0);
  const [toast, setToast] = useState(null);
  const [finishTime, setFinishTime] = useState(null);
  const [stage, setStage] = useState("play");
  const [rank, setRank] = useState(null);
  const [muted, setMuted] = useState(false);
  const [pausedTime, setPausedTime] = useState("00:00");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    worldObjects.length = 0;
    solidBounds.length = 0;
    animatedWater.length = 0;
    driftingClouds.length = 0;
    lanternLights.length = 0;
    textureCache.clear();
    materialCache.clear();

    const timeouts = [];
    const later = (fn, ms) => timeouts.push(setTimeout(fn, ms));
    let toastId = 0;
    const showToast = (title, body, tone = "gold") => {
      toastId += 1;
      setToast({ id: toastId, title, body, tone });
      const current = toastId;
      later(() => setToast((prev) => (prev && prev.id === current ? null : prev)), 3200);
    };

    const scene = new THREE.Scene();
    const sunDirection = new THREE.Vector3(-0.62, 0.34, 0.5).normalize();
    scene.fog = new THREE.Fog(palette.fog, 48, 185);

    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.3, 230);
    camera.position.set(0, 14, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.info.autoReset = false;
    mount.appendChild(renderer.domElement);

    const sky = createSky(scene, sunDirection);

    // 하늘을 환경광으로 구워 넣어 물과 금속 장식이 노을빛을 반사하게 한다.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(sky.geometry, sky.material));
    const envTarget = pmrem.fromScene(envScene, 0.04, 0.1, 500);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const ambient = new THREE.HemisphereLight(0xffd9b0, 0x4d6b3c, 0.55);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffc68a, 3.1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 140;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    scene.add(sun.target);

    buildWorld(scene);
    const orbSystem = createOrbs(scene);
    const fireflies = createFireflies(scene);
    const petals = createPetals(scene);
    const fireworks = createFireworks(scene);
    const sound = createSound();

    // 모든 구슬을 모으면 사원 꼭대기에서 빛기둥이 솟는다.
    const finaleGeometry = new THREE.CylinderGeometry(0.9, 1.6, 60, 12, 1, true);
    const finaleMaterial = new THREE.MeshBasicMaterial({
      map: getBeamTexture(),
      color: new THREE.Color(2.6, 1.8, 0.8),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
    });
    const finaleBeam = new THREE.Mesh(finaleGeometry, finaleMaterial);
    finaleBeam.position.set(0, 49.5, 0.8);
    finaleBeam.visible = false;
    scene.add(finaleBeam);

    const cat = createCat(scene);
    const catShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    catShadow.rotation.x = -Math.PI / 2;
    catShadow.position.set(0, 0.04, 34);
    scene.add(catShadow);

    const composerTarget = new THREE.WebGLRenderTarget(mount.clientWidth * pixelRatio, mount.clientHeight * pixelRatio, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const composer = new EffectComposer(renderer, composerTarget);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.55, 0.65, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const player = {
      position: new THREE.Vector3(0, 1.7, 34),
      yaw: Math.PI,
      pitch: -0.15,
      velocityY: 0,
      grounded: true,
      jumpLockUntil: 0,
    };

    const game = {
      entered: false,
      elapsed: 0,
      collected: 0,
      finished: false,
      hintShown: false,
      finaleT: 0,
      lastTimerText: "",
      frameMs: 0,
      stage: "play",
    };

    const clock = new THREE.Clock();
    const pointer = { active: false };

    // 프레임이 버거운 기기에서는 해상도, 블룸, 그림자 순서로 품질을 낮춘다.
    const quality = { level: 0, time: 0, frames: 0, warmup: 1.5 };
    const degradeQuality = () => {
      quality.level += 1;
      if (quality.level === 1) {
        renderer.setPixelRatio(1);
        composer.setPixelRatio(1);
        composer.setSize(mount.clientWidth, mount.clientHeight);
      } else if (quality.level === 2) {
        bloom.enabled = false;
      } else if (quality.level === 3) {
        sun.castShadow = false;
      }
    };
    const trackQuality = (frameDelta) => {
      if (quality.level >= 3 || document.hidden || frameDelta > 0.5) return;
      if (quality.warmup > 0) {
        quality.warmup -= frameDelta;
        return;
      }
      quality.time += frameDelta;
      quality.frames += 1;
      if (quality.time >= 2) {
        if (quality.time / quality.frames > 1 / 40) degradeQuality();
        quality.time = 0;
        quality.frames = 0;
      }
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
      getStage: () => game.stage,
      skipCutscene: () => skipCutscene(),
      getStats: () => ({ quality: quality.level, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, frameMs: Number(game.frameMs.toFixed(2)) }),
      collectAll: () =>
        orbSystem.orbs.forEach((orb) => {
          player.position.set(orb.position[0], orb.position[1] + 0.9, orb.position[2]);
          collectOrbs();
        }),
      getOrbs: () => orbSystem.orbs.map((orb) => ({ label: orb.label, position: orb.position, collected: orb.collected })),
      forceLock: () => {
        pointer.active = true;
        game.entered = true;
        setIsLocked(true);
        setHasEntered(true);
      },
    };

    let compassWidth = compassRef.current?.clientWidth ?? 420;

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      compassWidth = compassRef.current?.clientWidth ?? compassWidth;
    };

    const requestLock = () => {
      if (game.stage !== "play") return;
      sound.unlock();
      try {
        const result = renderer.domElement.requestPointerLock();
        if (result && typeof result.catch === "function") result.catch(() => {});
      } catch {
        // 포인터 잠금을 지원하지 않는 환경에서는 조용히 넘어간다.
      }
    };

    const restart = () => {
      game.stage = "play";
      setStage("play");
      fireworks.clear();
      resetLanterns();
      orbSystem.reset();
      game.elapsed = 0;
      game.collected = 0;
      game.finished = false;
      game.hintShown = false;
      game.finaleT = 0;
      finaleBeam.visible = false;
      finaleMaterial.opacity = 0;
      player.position.set(0, 1.7, 34);
      player.yaw = Math.PI;
      player.velocityY = 0;
      setCollected(0);
      setFinishTime(null);
      setRank(null);
      requestLock();
    };

    const freeRoam = () => {
      game.stage = "play";
      setStage("play");
      requestLock();
    };

    controlsRef.current = {
      start: requestLock,
      restart,
      freeRoam,
      skip: () => skipCutscene(),
      toggleMute: () => setMuted(sound.toggle()),
    };

    const handleKeyDown = (event) => {
      if (game.stage === "cutscene" && ["Enter", "Space", "Escape"].includes(event.code)) {
        event.preventDefault();
        skipCutscene();
        return;
      }
      keyState[event.code] = true;
      // 짧게 톡 친 스페이스도 놓치지 않도록 누르는 순간 점프를 건다.
      if (event.code.startsWith("Arrow") && pointer.active) {
        event.preventDefault();
      }
      if (event.code === "Space" && pointer.active) {
        event.preventDefault();
        tryJump();
      }
      if (event.code === "KeyM" && !event.repeat) {
        setMuted(sound.toggle());
      }
      if (event.code === "Enter" && !pointer.active) {
        requestLock();
      }
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

    const handlePointerChange = () => {
      pointer.active = document.pointerLockElement === renderer.domElement;
      setIsLocked(pointer.active);
      if (!pointer.active) {
        Object.keys(keyState).forEach((code) => {
          keyState[code] = false;
        });
        setPausedTime(formatTime(game.elapsed));
      }
      if (pointer.active) {
        if (!game.entered) {
          later(() => showToast("영혼의 구슬을 찾아라", "사원 정원 곳곳에 흩어진 일곱 개의 빛을 모으세요."), 700);
        }
        game.entered = true;
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
      if (!pointer.active || game.stage !== "play") {
        return { moving: false, speed: 0 };
      }

      const moveDirection = new THREE.Vector3();
      const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
      const right = new THREE.Vector3(-Math.cos(player.yaw), 0, Math.sin(player.yaw));

      // WASD와 방향키를 같은 이동으로 받는다.
      if (keyState.KeyW || keyState.ArrowUp) moveDirection.add(forward);
      if (keyState.KeyS || keyState.ArrowDown) moveDirection.sub(forward);
      if (keyState.KeyD || keyState.ArrowRight) moveDirection.add(right);
      if (keyState.KeyA || keyState.ArrowLeft) moveDirection.sub(right);

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
      // 땅에 서 있던 상태라면 한 프레임에 계단 한 칸 높이까지는 올라선다. 프레임이 낮아도 계단을 오를 수 있다.
      const stepAllowance = player.grounded ? 0.62 : 0.2;
      const closeToGround = supportHeight !== null && feetY - supportHeight <= 0.2 && supportHeight - feetY <= stepAllowance;
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

    const collectOrbs = () => {
      const body = new THREE.Vector3(player.position.x, player.position.y - 0.9, player.position.z);
      orbSystem.orbs.forEach((orb) => {
        if (orb.collected) return;
        const distance = body.distanceTo(new THREE.Vector3(...orb.position));
        if (distance > 1.6) return;
        orb.collected = true;
        orb.collectT = 0;
        game.collected += 1;
        setCollected(game.collected);
        const total = orbSystem.orbs.length;
        if (game.collected === total) {
          game.finished = true;
          setFinishTime(formatTime(game.elapsed));
          setRank(game.elapsed <= 60 ? "S" : game.elapsed <= 120 ? "A" : "B");
          startCutscene();
        } else {
          showToast(`영혼의 구슬 ${game.collected} / ${total}`, `${orb.label}에서 빛을 되찾았습니다.`);
          sound.play([
            [987.77, 0, 0.7, 0.08],
            [1318.51, 0.09, 1, 0.07],
          ]);
          const remaining = orbSystem.orbs.filter((item) => !item.collected);
          if (remaining.length === 1 && remaining[0].hint && !game.hintShown) {
            game.hintShown = true;
            later(() => showToast("마지막 단서", remaining[0].hint, "hint"), 3400);
          }
        }
      });
    };

    const updateHud = (heading) => {
      if (compassStripRef.current) {
        compassStripRef.current.style.transform = `translateX(${compassWidth / 2 - (heading + 180) * COMPASS_PX_PER_DEG}px)`;
      }
      let nearest = null;
      let nearestDistance = Infinity;
      orbSystem.orbs.forEach((orb) => {
        if (orb.collected) return;
        const d = Math.hypot(orb.position[0] - player.position.x, orb.position[2] - player.position.z);
        if (d < nearestDistance) {
          nearestDistance = d;
          nearest = orb;
        }
      });
      const marker = compassOrbRef.current;
      if (marker) {
        if (nearest) {
          const bearing = THREE.MathUtils.radToDeg(Math.atan2(nearest.position[0] - player.position.x, -(nearest.position[2] - player.position.z)));
          const relative = ((bearing - heading + 540) % 360) - 180;
          const half = compassWidth / 2 - 14;
          const offset = THREE.MathUtils.clamp(relative * COMPASS_PX_PER_DEG, -half, half);
          marker.style.opacity = "1";
          marker.style.transform = `translateX(${compassWidth / 2 + offset}px)`;
          marker.dataset.edge = Math.abs(relative * COMPASS_PX_PER_DEG) > half ? (relative < 0 ? "left" : "right") : "";
        } else {
          marker.style.opacity = "0";
        }
      }
      if (distanceRef.current) {
        distanceRef.current.textContent = nearest ? `가장 가까운 빛 ${Math.round(nearestDistance)}m` : "모든 빛을 되찾았습니다";
      }
      const timerText = formatTime(game.elapsed);
      if (timerRef.current && timerText !== game.lastTimerText) {
        timerRef.current.textContent = timerText;
        game.lastTimerText = timerText;
      }
    };

    // ── 스테이지 클리어 컷신 ──
    const CUTSCENE_LENGTH = 10;
    const templeTop = new THREE.Vector3(0, 12, 0.8);
    const cutscene = { t: 0, angle0: 0, catAngle: 0, nextRocket: 0, catPos: new THREE.Vector3() };

    // 클리어하면 노을이 밤으로 저물어 불꽃이 잘 보이게 한다. k=0은 노을, k=1은 밤.
    const duskFrom = {
      top: new THREE.Color(palette.skyTop),
      horizon: new THREE.Color(palette.skyHorizon),
      ground: new THREE.Color(palette.skyGround),
      sun: new THREE.Color(palette.sun),
      fog: new THREE.Color(palette.fog),
    };
    const duskTo = {
      top: new THREE.Color("#070b1f"),
      horizon: new THREE.Color("#5e3150"),
      ground: new THREE.Color("#2a1d2c"),
      sun: new THREE.Color("#5a2a20"),
      fog: new THREE.Color("#3b2a3d"),
    };
    const applyDusk = (k) => {
      const u = sky.material.uniforms;
      u.topColor.value.copy(duskFrom.top).lerp(duskTo.top, k);
      u.horizonColor.value.copy(duskFrom.horizon).lerp(duskTo.horizon, k);
      u.groundColor.value.copy(duskFrom.ground).lerp(duskTo.ground, k);
      u.sunColor.value.copy(duskFrom.sun).lerp(duskTo.sun, k);
      scene.fog.color.copy(duskFrom.fog).lerp(duskTo.fog, k);
      sun.intensity = THREE.MathUtils.lerp(3.1, 0.9, k);
      ambient.intensity = THREE.MathUtils.lerp(0.55, 0.3, k);
      scene.environmentIntensity = THREE.MathUtils.lerp(0.55, 0.18, k);
    };
    const shockMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(3, 2.1, 0.9),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
    });
    const shockGeometry = new THREE.RingGeometry(0.85, 1, 64);
    const shockwave = new THREE.Mesh(shockGeometry, shockMaterial);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(0, 3, 0.8);
    shockwave.visible = false;
    scene.add(shockwave);
    const lanternMaterial = getBlockMaterial(palette.lantern, { tex: null, emissive: "#ffb347", emissiveIntensity: 3.2 });

    const resetLanterns = () => {
      applyDusk(0);
      lanternLights.forEach((light) => {
        light.intensity = 7;
      });
      lanternMaterial.emissiveIntensity = 3.2;
    };

    const fanfare = () => {
      sound.play([
        [523.25, 0, 0.5, 0.07],
        [659.25, 0.11, 0.5, 0.07],
        [783.99, 0.22, 0.5, 0.07],
        [1046.5, 0.33, 0.9, 0.08],
        [783.99, 0.62, 0.3, 0.06],
        [1046.5, 0.75, 2.4, 0.08],
        [1318.51, 0.75, 2.4, 0.06],
        [1567.98, 0.75, 2.4, 0.05],
        [261.63, 0.75, 2.4, 0.05],
      ]);
    };

    const startCutscene = () => {
      game.stage = "cutscene";
      cutscene.t = 0;
      cutscene.nextRocket = 0.9;
      cutscene.angle0 = Math.atan2(player.position.x - templeTop.x, player.position.z - templeTop.z);
      cutscene.catAngle = Math.atan2(camera.position.x - player.position.x, camera.position.z - player.position.z);
      cutscene.catPos.copy(player.position);
      Object.keys(keyState).forEach((code) => {
        keyState[code] = false;
      });
      finaleBeam.visible = true;
      game.finaleT = 0;
      shockwave.visible = true;
      fireworks.sparkle(player.position.x, player.position.y - 0.6, player.position.z, 36);
      setToast(null);
      setStage("cutscene");
      fanfare();
      if (document.pointerLockElement) document.exitPointerLock();
    };

    const skipCutscene = () => {
      if (game.stage === "cutscene") cutscene.t = Math.max(cutscene.t, CUTSCENE_LENGTH);
    };

    const updateCutscene = (dt) => {
      cutscene.t += dt;
      const t = cutscene.t;

      // 충격파와 등불
      const shockT = Math.min(t / 1.8, 1);
      shockwave.scale.setScalar(1 + shockT * 46);
      shockMaterial.opacity = (1 - shockT) * 0.9;
      if (shockT >= 1) shockwave.visible = false;
      const glow = Math.min(t / 2, 1);
      lanternLights.forEach((light) => {
        light.intensity = 7 + glow * 10;
      });
      lanternMaterial.emissiveIntensity = 3.2 + glow * 4;
      applyDusk(THREE.MathUtils.smoothstep(t, 0.4, 3.6));

      // 불꽃놀이. 컷신 중에는 촘촘하게, 결과 화면에서는 느긋하게 쏘아 올린다.
      const interval = game.stage === "cutscene" ? 0.42 : 1.5;
      if (t >= cutscene.nextRocket) {
        const r = fireworks.random;
        const salvo = game.stage === "cutscene" && t > 3 && r() < 0.35 ? 3 : 1;
        for (let i = 0; i < salvo; i += 1) {
          fireworks.launch(-18 + r() * 36, -10 + r() * 18, 18 + r() * 12, fireworks.randomColor());
        }
        cutscene.nextRocket = t + interval * (0.7 + r() * 0.6);
      }

      // 카메라: 깡충 뛰는 고양이를 먼저 비추고, 사원을 크게 돌며 불꽃이 터지는 하늘을 올려다본다.
      let desired;
      let focus;
      if (t < 2) {
        const a = cutscene.catAngle + t * 0.45;
        desired = cutscene.catPos.clone().add(new THREE.Vector3(Math.sin(a) * 6, 1.6 + t * 0.5, Math.cos(a) * 6));
        focus = cutscene.catPos.clone().add(new THREE.Vector3(0, -0.6, 0));
      } else {
        const ct = Math.min(t - 2, 12);
        const angle = cutscene.angle0 + 0.5 + (t - 2) * 0.12;
        const radius = 30 + ct * 1.2;
        desired = new THREE.Vector3(templeTop.x + Math.sin(angle) * radius, 7 + ct * 0.5, templeTop.z + Math.cos(angle) * radius);
        focus = new THREE.Vector3(0, 12 + ct * 0.8, 0.8);
      }
      camera.position.lerp(desired, t < 2 ? 0.08 : 0.025);
      lookTarget.lerp(focus, t < 2 ? 0.2 : 0.04);
      camera.lookAt(lookTarget);
      camera.fov = THREE.MathUtils.lerp(camera.fov, t < 2 ? 50 : 60, 0.05);

      if (game.stage === "cutscene" && t >= CUTSCENE_LENGTH) {
        game.stage = "results";
        setStage("results");
      }
    };

    const orbitCenter = new THREE.Vector3(0, 7, 4);
    const lookTarget = new THREE.Vector3();
    const followOffset = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const xAxis = new THREE.Vector3(1, 0, 0);

    const animate = () => {
      const frameStart = performance.now();
      renderer.info.reset();
      const frameDelta = clock.getDelta();
      trackQuality(frameDelta);
      const rawDelta = Math.min(frameDelta, 0.05);
      const delta = Math.min(rawDelta, 0.03);
      const { moving, speed } = movePlayer(delta * 5);
      const time = performance.now() * 0.001;

      if (pointer.active && !game.finished) {
        game.elapsed += rawDelta;
      }
      if (pointer.active) {
        collectOrbs();
      }

      cat.root.position.set(player.position.x, player.position.y - 1.7, player.position.z);
      cat.root.rotation.y = player.yaw;

      const stride = moving ? performance.now() * 0.012 * (speed / 7) : 0;
      cat.legs.forEach((leg, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        leg.rotation.x = moving ? Math.sin(stride) * 0.45 * direction : 0;
      });
      cat.tailBase.rotation.x = moving ? -0.35 + Math.sin(stride * 0.7) * 0.18 : -0.28 + Math.sin(time * 1.6) * 0.06;
      cat.root.position.y += moving ? Math.abs(Math.sin(stride)) * 0.06 : Math.sin(time * 2.2) * 0.028;
      if (game.stage === "cutscene" && cutscene.t < 2.4) {
        // 클리어 순간 고양이가 세 번 깡충 뛴다.
        cat.root.position.y += Math.abs(Math.sin((cutscene.t * Math.PI) / 0.8)) * 0.9;
        cat.tailBase.rotation.x = -0.9;
      }
      catShadow.position.set(player.position.x, player.position.y - 1.7 + 0.04, player.position.z);
      const shadowPulse = moving ? 0.9 + Math.abs(Math.sin(stride)) * 0.08 : 0.92 + Math.sin(time * 2.2) * 0.02;
      catShadow.scale.set(shadowPulse, shadowPulse * 0.82, 1);

      animatedWater.forEach((surface) => {
        surface.mesh.position.y = surface.baseY + Math.sin(time * 1.8 + surface.phase) * 0.04;
      });
      driftingClouds.forEach((cloud) => {
        cloud.mesh.position.x = cloud.baseX + Math.sin(time * 0.11 + cloud.offset) * 1.4;
        cloud.mesh.position.z = cloud.baseZ + Math.cos(time * 0.09 + cloud.offset) * 0.45;
      });
      orbSystem.update(time, rawDelta);
      fireflies.update(time);
      petals.update(time, rawDelta);
      fireworks.update(rawDelta, () => sound.pop(game.stage === "cutscene" ? 0.16 : 0.08));

      if (finaleBeam.visible) {
        game.finaleT += rawDelta;
        finaleMaterial.opacity = Math.min(game.finaleT / 1.6, 1) * (0.42 + Math.sin(time * 3) * 0.06);
        finaleBeam.rotation.y = time * 0.4;
      }

      if (game.stage !== "play") {
        updateCutscene(rawDelta);
      } else if (game.entered) {
        followOffset
          .set(0, 3.2, -6.2)
          .applyAxisAngle(yAxis, player.yaw)
          .applyAxisAngle(xAxis, player.pitch * 0.18);
        const desiredCamera = player.position.clone().add(followOffset);
        camera.position.lerp(desiredCamera, 0.14);
        lookTarget.lerp(new THREE.Vector3(player.position.x, player.position.y + 1.1, player.position.z), 0.25);
        camera.lookAt(lookTarget);
        const targetFov = moving && speed > 7 ? 70 : 62;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
      } else {
        // 타이틀 화면에서는 카메라가 사원 주위를 천천히 돈다.
        const angle = time * 0.06 + 0.35;
        camera.position.set(Math.sin(angle) * 40, 15 + Math.sin(time * 0.2) * 1.5, Math.cos(angle) * 40);
        lookTarget.copy(orbitCenter);
        camera.lookAt(lookTarget);
        camera.fov = 52;
      }
      camera.updateProjectionMatrix();

      sky.position.copy(camera.position);
      const focus = game.stage !== "play" ? templeTop : game.entered ? player.position : orbitCenter;
      sun.target.position.set(focus.x, 0, focus.z);
      sun.position.copy(sun.target.position).addScaledVector(sunDirection, 70);

      const heading = ((THREE.MathUtils.radToDeg(Math.PI - player.yaw) % 360) + 360) % 360;
      updateHud(heading);

      composer.render();
      game.frameMs = game.frameMs * 0.9 + (performance.now() - frameStart) * 0.1;
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerChange);
    const handleCanvasClick = () => (game.stage === "cutscene" ? skipCutscene() : requestLock());
    renderer.domElement.addEventListener("click", handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationId);
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerChange);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      mount.removeChild(renderer.domElement);
      worldObjects.forEach((mesh) => mesh.geometry.dispose());
      materialCache.forEach((material) => material.dispose());
      textureCache.forEach((texture) => texture.dispose());
      orbSystem.dispose();
      fireflies.dispose();
      petals.dispose();
      finaleGeometry.dispose();
      fireworks.dispose();
      shockGeometry.dispose();
      shockMaterial.dispose();
      finaleMaterial.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
      envTarget.dispose();
      cat.dispose();
      catShadow.geometry.dispose();
      catShadow.material.dispose();
      composerTarget.dispose();
      composer.dispose();
      sound.close();
      delete window.__mindCraftDebug;
      renderer.dispose();
    };
  }, []);

  const total = ORB_SPOTS.length;
  const phase =
    stage === "cutscene" ? "cutscene" : stage === "results" ? "results" : !hasEntered ? "title" : isLocked ? "playing" : "paused";

  return (
    <div className={`game phase-${phase}`}>
      <div ref={mountRef} className="viewport" />
      <div className="vignette" aria-hidden="true" />
      <div className="letterbox" aria-hidden="true" />

      <div className="hud" aria-hidden={phase !== "playing"}>
        <div className="compass" ref={compassRef}>
          <div className="compass-strip" ref={compassStripRef}>
            {COMPASS_TICKS.map((deg) => {
              const norm = ((deg % 360) + 360) % 360;
              const label = COMPASS_LABELS[norm];
              return (
                <span
                  key={deg}
                  className={`compass-tick${label ? " has-label" : ""}${label && label.length === 1 ? " is-cardinal" : ""}`}
                  style={{ left: `${(deg + 180) * COMPASS_PX_PER_DEG}px` }}
                >
                  {label ?? ""}
                </span>
              );
            })}
          </div>
          <div className="compass-orb" ref={compassOrbRef} />
          <div className="compass-needle" />
        </div>

        <section className="panel objective">
          <p className="panel-kicker">Objective</p>
          <p className="objective-title">영혼의 구슬 모으기</p>
          <div className="orb-pips">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={i < collected ? "is-on" : ""} />
            ))}
          </div>
          <p className="objective-meta">
            <b>{collected}</b>
            <span className="slash">/</span>
            {total}
            <span className="dot">·</span>
            <span ref={distanceRef}>가장 가까운 빛 --</span>
          </p>
        </section>

        <section className="panel timer">
          <p className="panel-kicker">Time</p>
          <b ref={timerRef}>00:00</b>
        </section>

        <div className="controls">
          <div className="control">
            <span className="keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            <span className="key-or">/</span>
            <span className="keys">
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
            </span>
            <span>이동</span>
          </div>
          <div className="control">
            <kbd className="wide">Shift</kbd>
            <span>질주</span>
          </div>
          <div className="control">
            <kbd className="wide">Space</kbd>
            <span>점프</span>
          </div>
          <div className="control">
            <kbd>M</kbd>
            <span>{muted ? "소리 꺼짐" : "소리"}</span>
          </div>
          <div className="control">
            <kbd className="wide">Esc</kbd>
            <span>일시정지</span>
          </div>
        </div>
      </div>

      {toast && phase === "playing" && (
        <div className={`toast tone-${toast.tone}`} key={toast.id} role="status">
          <span className="toast-gem" aria-hidden="true" />
          <div>
            <p className="toast-title">{toast.title}</p>
            <p className="toast-body">{toast.body}</p>
          </div>
        </div>
      )}

      {phase === "cutscene" && (
        <div className="cutscene" role="status">
          <div className="flash" aria-hidden="true" />
          <div className="finish-banner">
            <p className="finish-kicker">Stage Clear</p>
            <h2>All Spirits Restored</h2>
            <p className="finish-body">일곱 개의 구슬이 모두 사원으로 돌아왔습니다</p>
          </div>
          <button type="button" className="skip-button" onClick={() => controlsRef.current.skip?.()}>
            건너뛰기 <kbd className="wide">Enter</kbd>
          </button>
        </div>
      )}

      {phase === "results" && (
        <div className="results-screen">
          <div className="results-card">
            <p className="finish-kicker">Stage Clear</p>
            <h2>사원의 빛을 되찾았습니다</h2>
            <div className="rank" aria-label={`등급 ${rank}`}>
              <span>{rank}</span>
            </div>
            <div className="pause-stats">
              <div>
                <span>구슬</span>
                <b>
                  {collected} / {total}
                </b>
              </div>
              <div>
                <span>기록</span>
                <b>{finishTime}</b>
              </div>
            </div>
            <p className="rank-note">S 1분 이내 · A 2분 이내 · B 그 이상</p>
            <div className="pause-actions">
              <button type="button" className="btn-primary" onClick={() => controlsRef.current.restart?.()}>
                <span className="btn-icon" aria-hidden="true" />
                다시 도전
              </button>
              <button type="button" className="btn-ghost" onClick={() => controlsRef.current.freeRoam?.()}>
                자유 탐험
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="title-screen" aria-hidden={phase !== "title"}>
        <div className="title-inner">
          <p className="eyebrow">A Voxel Adventure</p>
          <h1 className="logo">
            <span>MindCraft</span>
            <span className="logo-sub">
              <i aria-hidden="true" />
              Temple
              <i aria-hidden="true" />
            </span>
          </h1>
          <p className="tagline">
            해 질 녘 사원 정원에 일곱 개의 영혼 구슬이 흩어졌습니다.
            <br />
            장화 신은 고양이가 되어 빛을 모두 되찾으세요.
          </p>
          <div className="menu">
            <button type="button" className="btn-primary" onClick={() => controlsRef.current.start?.()}>
              <span className="btn-icon" aria-hidden="true" />
              탐험 시작
            </button>
            <span className="menu-hint">
              또는 <kbd>Enter</kbd>
            </span>
          </div>
          <div className="title-controls">
            <span>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
              <span className="key-or">/</span>
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd> 이동
            </span>
            <span>
              <kbd className="wide">Mouse</kbd> 시점
            </span>
            <span>
              <kbd className="wide">Shift</kbd> 질주
            </span>
            <span>
              <kbd className="wide">Space</kbd> 점프
            </span>
          </div>
          <p className="touch-note">키보드와 마우스가 있는 데스크톱에서 플레이하세요.</p>
        </div>
      </div>

      <div className="pause-screen" aria-hidden={phase !== "paused"}>
        <div className="pause-card">
          <p className="panel-kicker">{finishTime ? "Quest Complete" : "Paused"}</p>
          <h2>{finishTime ? "모든 빛을 되찾았습니다" : "일시정지"}</h2>
          <div className="pause-stats">
            <div>
              <span>구슬</span>
              <b>
                {collected} / {total}
              </b>
            </div>
            <div>
              <span>{finishTime ? "기록" : "진행 시간"}</span>
              <b>{finishTime ?? pausedTime}</b>
            </div>
          </div>
          <div className="pause-actions">
            <button type="button" className="btn-primary" onClick={() => controlsRef.current.start?.()}>
              <span className="btn-icon" aria-hidden="true" />
              계속하기
            </button>
            <button type="button" className="btn-ghost" onClick={() => controlsRef.current.restart?.()}>
              처음부터
            </button>
            <button type="button" className="btn-ghost" onClick={() => controlsRef.current.toggleMute?.()}>
              {muted ? "소리 켜기" : "소리 끄기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
