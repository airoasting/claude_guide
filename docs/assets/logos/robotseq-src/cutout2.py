#!/usr/bin/env python3
"""robots.png / robots.mp4 프레임의 갈색 배경을 지우고 알파를 만든다.

배경은 거의 단색(약 154,82,51)에 은은한 비네트만 있다. 그래서
(1) 테두리에서 배경색을 추정하고, (2) 그 색과 아주 가까운 픽셀만(거리 18) 후보로 두고,
(3) 테두리부터 인접 색차가 작을 때만 번지는 영역 성장으로 칠한다.
캐릭터 경계는 색이 크게 튀어 번짐이 멈춘다.

허용 오차가 중요하다. 배경은 거의 평평해서 기준색에서 6 이상 벗어나지 않는데,
그늘진 주황 다리는 37~41밖에 떨어져 있지 않다. 오차를 60쯤으로 잡으면 다리와 팔이
배경으로 딸려 나가 통째로 지워진다.

가장자리 픽셀에는 갈색이 섞여 있다. 그대로 두면 밝은 배경 위에서 어두운 테두리로
뜨므로, 속을 2px 깎고 바깥을 가장 가까운 속 색으로 덮은 뒤 알파만 부드럽게 준다.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def bg_color(f):
    edge = np.concatenate([f[:6].reshape(-1, 3), f[-6:].reshape(-1, 3),
                           f[:, :6].reshape(-1, 3), f[:, -6:].reshape(-1, 3)])
    return np.median(edge, axis=0)


def background_mask(rgb, step_tol=13.0, color_tol=18.0):
    h, w, _ = rgb.shape
    f = rgb.astype(np.float32)
    base = bg_color(f)
    dist = np.linalg.norm(f - base, axis=2)
    cand = dist < color_tol

    bg = np.zeros((h, w), bool)
    dq = deque()
    ys, xs = np.nonzero(cand)
    border = (ys == 0) | (ys == h - 1) | (xs == 0) | (xs == w - 1)
    for y, x in zip(ys[border], xs[border]):
        if not bg[y, x]:
            bg[y, x] = True
            dq.append((y, x))

    tol2 = step_tol * step_tol
    while dq:
        y, x = dq.popleft()
        c = f[y, x]
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not bg[ny, nx]:
                d = f[ny, nx] - c
                if d[0] * d[0] + d[1] * d[1] + d[2] * d[2] < tol2:
                    bg[ny, nx] = True
                    dq.append((ny, nx))

    # 캐릭터 사이나 다리 틈에 갇혀 못 들어간 배경색 주머니를 줍는다
    island = cand & ~bg
    lab, n = ndimage.label(island)
    if n:
        for i in range(1, n + 1):
            m = lab == i
            if m.sum() >= 20 and np.linalg.norm(f[m].mean(0) - base) < color_tol * 0.8:
                bg |= m
    return bg, base


def drop_shadow(rgb, bg, base, cos_tol=0.994, bright_k=1.16, floor_margin=20):
    """바닥에 드리운 그림자를 배경으로 넘긴다.

    그림자는 배경과 색조가 같고 밝기만 낮다. 색거리로는 못 거른다.
    측정값(2026-08-02 robots.mp4): 배경 밝기 100, 그림자 84, 주황 캐릭터 132.
    그래서 '배경과 같은 방향의 색(코사인 0.995 이상)이면서 배경 밝기의 1.06배 미만'을 후보로 둔다.

    **색만 보면 캐릭터가 깎인다.** 주황 캐릭터는 배경과 같은 주황이라, 모션 블러로 흐려진
    팔이 배경 밝기까지 내려온다. 실제로 s048에서 오른팔이 통째로 지워졌다.
    그래서 후보 중 **그 열의 캐릭터 발치보다 아래**에 있는 것만 그림자로 본다.
    팔은 발치보다 위에 있으므로 살아남고, 바닥에 퍼진 그림자만 걸린다.

    floor_margin을 키우면 발까지 깎이고, 줄이면 다리 밑 그림자가 남는다.
    4로는 캐릭터 몸에 붙은 발밑 그림자가 남아 20까지 올렸다(2026-08-02 사용자 재지적).
    그만큼 세게 지우면 회전 중인 주황 캐릭터가 깨지는 프레임이 늘어나는데,
    그건 build_robots.py의 repair_broken()이 이웃 프레임으로 대체해 받아 낸다.
    """
    f = rgb.astype(np.float32)
    nb = base / np.linalg.norm(base)
    n = f / np.maximum(np.linalg.norm(f, axis=2, keepdims=True), 1e-6)
    cand = ((n * nb).sum(2) > cos_tol) & (f.mean(2) < base.mean() * bright_k)

    solid = (~bg) & ~cand                        # 색으로 확실한 캐릭터
    rows = np.arange(solid.shape[0])[:, None]
    bottom = np.where(solid, rows, -1).max(0)    # 열별 캐릭터 최하단 y
    return bg | (cand & (rows > (bottom[None, :] - floor_margin)))


def cutout(img, step_tol=13.0, color_tol=18.0, shadow=True):
    rgb = np.asarray(img.convert("RGB"))
    bg, base = background_mask(rgb, step_tol, color_tol)
    if shadow:
        bg = drop_shadow(rgb, bg, base)
    fg = ~bg

    # 캐릭터 안에 갇힌 배경색 구멍만 메운다(작은 것만)
    holes = ndimage.binary_fill_holes(fg) & ~fg
    hlab, hn = ndimage.label(holes)
    if hn:
        hsz = ndimage.sum(holes, hlab, range(1, hn + 1))
        fg = fg | np.isin(hlab, np.nonzero(hsz < 400)[0] + 1)

    # 캐릭터에서 떨어져 나온 그림자 조각을 지운다.
    # 크기로는 못 거른다(800px을 훌쩍 넘는다). 대신 조각을 이루는 색을 본다.
    # 캐릭터는 밝은 주황·파랑·흰색이 대부분이고, 그림자 조각은 배경 색조의 어두운 픽셀로만 채워져 있다.
    if shadow:
        f = rgb.astype(np.float32)
        nb = base / np.linalg.norm(base)
        n_ = f / np.maximum(np.linalg.norm(f, axis=2, keepdims=True), 1e-6)
        dark = ((n_ * nb).sum(2) > 0.994) & (f.mean(2) < base.mean() * 1.10)
        lab0, n0 = ndimage.label(fg)
        if n0:
            tot = ndimage.sum(fg, lab0, range(1, n0 + 1))
            drk = ndimage.sum(dark & fg, lab0, range(1, n0 + 1))
            ratio = np.divide(drk, np.maximum(tot, 1))
            fg = fg & ~np.isin(lab0, np.nonzero(ratio > 0.55)[0] + 1)

    # 배경에 남은 자잘한 얼룩(반짝이, 노이즈) 제거
    lab, n = ndimage.label(fg)
    if n:
        sizes = ndimage.sum(fg, lab, range(1, n + 1))
        keep = np.nonzero(sizes > max(sizes.max() * 0.05, 500))[0] + 1
        fg = np.isin(lab, keep)

    # 침식은 **색을 고르기 위한 것**이지 형태를 줄이려는 게 아니다.
    # 가장자리 픽셀에는 배경 갈색이 섞여 있으므로, 2px 안쪽(core)의 색만 믿고
    # 바깥은 가장 가까운 core 색으로 덮는다.
    core = ndimage.binary_erosion(fg, np.ones((3, 3), bool), iterations=2)
    if not core.any():
        core = fg
    idx = ndimage.distance_transform_edt(~core, return_indices=True)[1]
    clean = rgb[idx[0], idx[1]]

    # 알파는 core가 아니라 **fg**로 만든다. core로 만들면 팔처럼 얇은 부위가
    # 침식으로 통째로 빠져 반투명해진다(2026-08-02 사용자 지적: 주황 캐릭터 팔).
    a = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.fromarray(clean.astype(np.uint8), "RGB")
    out.putalpha(a)
    return out, fg


def bbox_of(masks, shape, pad=8):
    acc = np.zeros(shape, bool)
    for m in masks:
        acc |= m
    ys, xs = np.nonzero(acc)
    h, w = shape
    return (max(int(xs.min()) - pad, 0), max(int(ys.min()) - pad, 0),
            min(int(xs.max()) + pad + 1, w), min(int(ys.max()) + pad + 1, h))


if __name__ == "__main__":
    im = Image.open(sys.argv[1])
    out, fg = cutout(im)
    out.crop(bbox_of([fg], fg.shape)).save(sys.argv[2])
    print(sys.argv[2], out.size)
