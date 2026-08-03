#!/usr/bin/env python3
"""robots.mp4의 모든 프레임을 배경과 그림자 없는 고화질 WebP로 저장한다.

원본 24fps와 1280x720 해상도를 그대로 보존한다. 세 캐릭터는 모든 프레임에서
같은 캔버스에 있어야 재생할 때 크기와 위치가 흔들리지 않는다.
"""
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage


LOGOS = Path(__file__).resolve().parent.parent
SOURCE = LOGOS / "robots.mp4"
OUT_SEQ = LOGOS / "robotseq"
POSTER = LOGOS / "robots-cut.webp"
FRAME_COUNT = 240
FPS = 24
WORKERS = 6
_SESSION = None


def extract_frames(work: Path) -> list[Path]:
    """동영상의 원본 프레임을 한 장도 건너뛰지 않고 PNG로 뽑는다."""
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(SOURCE),
            "-vsync",
            "0",
            str(work / "source-%03d.png"),
        ],
        check=True,
    )
    frames = sorted(work.glob("source-*.png"))
    if len(frames) != FRAME_COUNT:
        raise RuntimeError(f"예상 프레임은 {FRAME_COUNT}장인데 {len(frames)}장이 추출됐습니다.")
    return frames


def clean_alpha(image: Image.Image) -> Image.Image:
    """배경 제거 결과에서 바닥 그림자와 작은 배경 장식을 없앤다.

    배경 분리 모델이 만든 알파에서 가장 큰 연결 영역 세 개만 남긴다. 세 영역은 파란 로봇,
    주황 로봇, 헤드폰 캐릭터다. 바닥 반짝이처럼 떨어져 있는 장식은 이 단계에서
    제외된다. 낮은 알파는 0으로, 높은 알파는 255로 부드럽게 보정해 흐린 그림자는
    없애면서 캐릭터 가장자리의 계단 현상은 막는다.
    """
    rgba = np.asarray(image.convert("RGBA")).copy()
    alpha = rgba[..., 3].astype(np.float32)

    labels, count = ndimage.label(alpha >= 8)
    if count < 3:
        raise RuntimeError(f"캐릭터 영역이 {count}개만 검출됐습니다.")
    sizes = ndimage.sum(labels > 0, labels, range(1, count + 1))
    keep = np.argsort(sizes)[-3:] + 1
    alpha[~np.isin(labels, keep)] = 0

    alpha = np.clip((alpha - 96.0) / 128.0, 0.0, 1.0)
    alpha = alpha * alpha * (3.0 - 2.0 * alpha)
    rgba[..., 3] = np.rint(alpha * 255.0).astype(np.uint8)
    return Image.fromarray(rgba)


def init_worker() -> None:
    """각 작업 프로세스에서 배경 제거 모델을 한 번만 연다."""
    global _SESSION
    _SESSION = new_session("isnet-general-use", providers=["CPUExecutionProvider"])


def build_frame(index: int, source: str) -> tuple[int, int]:
    """프레임 한 장을 처리하고 파일 크기를 돌려준다."""
    if _SESSION is None:
        raise RuntimeError("배경 제거 모델이 준비되지 않았습니다.")
    cutout = remove(Image.open(source).convert("RGB"), session=_SESSION)
    cutout = clean_alpha(cutout)
    target = OUT_SEQ / f"r{index:03d}.webp"
    cutout.save(target, "WEBP", quality=95, method=4)
    return index, target.stat().st_size


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    if OUT_SEQ.exists():
        shutil.rmtree(OUT_SEQ)
    OUT_SEQ.mkdir(parents=True)

    total = 0
    with tempfile.TemporaryDirectory(prefix="robots-frames-") as tmp:
        frames = extract_frames(Path(tmp))
        completed = 0
        with ProcessPoolExecutor(max_workers=WORKERS, initializer=init_worker) as executor:
            jobs = [executor.submit(build_frame, i, str(source)) for i, source in enumerate(frames)]
            for job in as_completed(jobs):
                _, size = job.result()
                total += size
                completed += 1
                if completed % FPS == 0 or completed == len(frames):
                    print(f"{completed}/{len(frames)} 프레임 완료", flush=True)

    shutil.copyfile(OUT_SEQ / "r000.webp", POSTER)

    print(
        f"{FRAME_COUNT}장, {FPS}fps, 1280x720, 합계 {total / 1024 / 1024:.1f}MB",
        flush=True,
    )


if __name__ == "__main__":
    main()
