#!/usr/bin/env python3
"""발밑에 남은 그림자를 프레임마다 한 장씩 열어 벗겨낸다.

cutout2.drop_shadow가 지우지 못하고 남기는 것은 캐릭터 몸에 **붙어 있는** 그림자다.
연결 성분으로도, 색만으로도 못 뗀다. 대신 위치로 뗀다.

세로줄마다 맨 아래 보이는 픽셀에서 위로 올라가며 그림자 색인 동안만 알파를 지운다.
발은 캐릭터 색이라 첫 줄에서 바로 멈추고, 그 아래 깔린 그림자만 벗겨진다.
그림자가 캐릭터에서 떨어져 아래에 떠 있어도 같은 원리로 지워진다.

허용치를 키우면 발끝이 깎인다. 지우기 전후 면적을 재서 한 프레임에서 너무 많이
사라지면 그 프레임은 건드리지 않고 넘어간다.
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

SEQ = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "robotseq")

COS_TOL = 0.992      # 배경과 같은 색조로 볼 기준
BRIGHT_K = 1.26      # 배경 밝기의 몇 배까지 그림자로 볼지
MAX_LOSS = 0.06      # 한 프레임에서 이보다 많이 지워지면 되돌린다
FEATHER = 0.8        # 벗겨낸 경계를 부드럽게


# 배경색은 프레임에서 못 읽는다. 배경을 지우고 저장한 webp라 투명 픽셀의 RGB가 0으로 날아간다.
# 원본 robots.mp4의 배경 중앙값을 그대로 쓴다(2026-08-02 측정).
BASE = np.array([185.0, 83.0, 33.0])
MAX_DEPTH = 90       # 발밑에서 위로 이만큼까지만 살핀다. 몸통까지 올라가지 않게 막는 뚜껑


def strip(path, verbose=False):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    rgb, alpha = a[..., :3], a[..., 3].copy()
    nb = BASE / np.linalg.norm(BASE)
    n = rgb / np.maximum(np.linalg.norm(rgb, axis=2, keepdims=True), 1e-6)
    shadowy = ((n * nb).sum(2) > COS_TOL) & (rgb.mean(2) < BASE.mean() * BRIGHT_K)

    before = (alpha > 40).sum()
    H, W = alpha.shape
    vis = alpha > 40
    has = vis.any(0)
    bottom = np.where(has, H - 1 - np.argmax(vis[::-1], axis=0), -1)  # 열별 최하단 보이는 y

    new = alpha.copy()
    cols = np.arange(W)
    alive = has.copy()          # 아직 그림자가 끊기지 않은 열
    for d in range(MAX_DEPTH):
        y = bottom - d
        ok = alive & (y >= 0)
        if not ok.any():
            break
        yy, xx = y[ok], cols[ok]
        hit = vis[yy, xx] & shadowy[yy, xx]
        new[yy[hit], xx[hit]] = 0
        alive[xx[~hit]] = False  # 캐릭터 색을 만난 열은 거기서 멈춘다
    after = (new > 40).sum()
    loss = 1 - after / max(before, 1)
    if loss > MAX_LOSS:
        if verbose:
            print("  %s 건너뜀 (손실 %.1f%%)" % (os.path.basename(path), 100 * loss))
        return 0, loss
    sm = Image.fromarray(new.astype(np.uint8)).filter(ImageFilter.GaussianBlur(FEATHER))
    out = Image.fromarray(rgb.astype(np.uint8))
    out.putalpha(sm)
    out.save(path, "WEBP", quality=78, method=6)
    return int(before - after), loss


# 손실 한도를 풀고 강제로 벗겨낼 프레임. 주황 캐릭터가 회전하는 구간이라
# 그림자가 다리와 얽혀 있어 기본 한도로는 건너뛰어진다(2026-08-02 눈으로 확인).
FORCE = [47, 53, 55, 56]

# 그래도 남는 프레임은 이웃으로 덮는다.
# r048·r049는 눈 한쪽이 지워졌고, r055는 벗겨낸 뒤에도 그림자 흔적이 남았다.
REPLACE = {48: 47, 49: 50, 55: 56}


def main():
    global MAX_LOSS
    paths = sorted(glob.glob(os.path.join(SEQ, "r???.webp")))
    if not paths:
        sys.exit("프레임이 없다: " + SEQ)
    total, skipped, touched = 0, 0, 0
    for p in paths:
        removed, loss = strip(p, verbose=True)
        if loss > MAX_LOSS:
            skipped += 1
        elif removed:
            total += removed
            touched += 1
    print("프레임 %d장 중 %d장에서 그림자 %d px 제거, %d장 건너뜀"
          % (len(paths), touched, total, skipped))

    keep = MAX_LOSS
    MAX_LOSS = 1.0
    for i in FORCE:
        p = os.path.join(SEQ, "r%03d.webp" % i)
        if os.path.exists(p):
            print("  강제 r%03d: %d px" % (i, strip(p)[0]))
    MAX_LOSS = keep

    for dst, src in REPLACE.items():
        sp = os.path.join(SEQ, "r%03d.webp" % src)
        dp = os.path.join(SEQ, "r%03d.webp" % dst)
        if os.path.exists(sp):
            Image.open(sp).save(dp, "WEBP", quality=78, method=6)
            print("  대체 r%03d ← r%03d" % (dst, src))


if __name__ == "__main__":
    main()
