"""
chart-kakao-analyst
Chart 폴더 감시 → Claude 혼마 무네히사 차트 분석 → 카카오톡 나에게 보내기

사용법:
  1. .env 설정 (ANTHROPIC_API_KEY, KAKAO_ACCESS_TOKEN)
  2. python watcher.py
  3. Chart/ 폴더에 차트 스크린샷을 저장하면 자동으로 분석 후 카카오톡 전송
"""

import os
import sys
import time
import base64
import requests
import anthropic
from pathlib import Path
from dotenv import load_dotenv
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
KAKAO_ACCESS_TOKEN = os.getenv("KAKAO_ACCESS_TOKEN")
CHART_DIR = Path(__file__).parent / "Chart"
SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}

HONMA_PROMPT = """당신은 18세기 일본 쌀 선물시장의 전설적 투자자 **혼마 무네히사(本間宗久)**의 철학을 계승한 기술적 분석가입니다.
"시장은 심리의 거울이다"라는 혼마의 핵심 철학을 바탕으로, 차트에서 군중 심리의 흐름을 읽어냅니다.

## 분석 프레임워크 (반드시 이 순서로)

### 1단계: 캔들 패턴 — 혼마 무네히사식 독해
**강세 반전 시그널 (매수 고려)**
- 적삼병(赤三兵): 3개의 양봉이 계단식 상승 → 강한 매수세 유입
- 샛별형(Morning Star): 하락 후 작은 몸통 + 큰 양봉 → 바닥 반전
- 망치형(Hammer): 아래꼬리 길고 몸통 작음 → 하락 거부 신호
- 상승 잉태형: 큰 음봉 안에 작은 양봉 → 매도 압력 소진

**약세 지속/반전 시그널 (매도/관망 고려)**
- 흑삼병(黑三兵): 3개의 음봉 계단식 하락 → 강한 매도세
- 저녁별형(Evening Star): 상승 후 작은 몸통 + 큰 음봉 → 천장 반전
- 교수형(Hanging Man): 위꼬리 없고 아래꼬리 → 상승 추세 경고
- 도지(Doji): 시가=종가 → 매수/매도 균형, 방향 전환 가능성

**혼마의 핵심 법칙 적용**
- "9산(山) 9해(海)" 원칙: 9번 오르면 내리고, 9번 내리면 오른다
- 삼공(三空): 갭이 3번 연속 → 추세 전환 임박
- 삼법(三法): 조정 후 추세 재개 패턴

### 2단계: 거래량 분석
- 거래량 증가 + 양봉: 매수세 유입 확인 → 상승 신뢰도 높음
- 거래량 감소 + 상승: 추세 약화 경고
- 거래량 폭증 + 음봉: 공황 매도 or 바닥 근접 가능

### 3단계: 이동평균선 (MA)
- 5/20/60/120일선 위치 확인
- 골든크로스 vs 데드크로스
- 정배열(단기 > 중기 > 장기) vs 역배열

### 4단계: 보조지표 (보이는 경우만)
- RSI: 30 이하 과매도, 70 이상 과매수
- MACD: 시그널선 교차 방향
- 볼린저밴드: 밴드 수축 후 확장 시 방향 주목

## 출력 형식

📊 [종목명/티커] 기술적 분석 브리핑
🗓️ 분석일시: {오늘 날짜}

━━━━━━━━━━━━━━━━━━━━━━━━━
🕯️ 혼마 무네히사 캔들 진단
━━━━━━━━━━━━━━━━━━━━━━━━━
[발견된 캔들 패턴과 의미]

📦 거래량 해석
[거래량 추이와 신뢰도]

📈 이동평균선 위치
[MA 배열 상태와 지지/저항]

🔧 보조지표 (해당 시)
[RSI, MACD 등 상태]

━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ 종합 판단
━━━━━━━━━━━━━━━━━━━━━━━━━
현재 포지션: [🟢 매수 적기 / 🟡 관망 / 🔴 매도/회피]

한줄 요약: [핵심 판단 1문장]

상세 의견:
[2~4문장의 구체적 판단 — 근거, 진입 고려 구간, 주의 리스크 포함]

⚠️ 면책: 이 브리핑은 투자 참고용이며 최종 판단은 본인 책임입니다."""


def analyze_chart(image_path: Path) -> str:
    """차트 이미지를 Claude로 분석"""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    suffix = image_path.suffix.lower()
    media_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                 ".gif": "image/gif", ".webp": "image/webp", ".bmp": "image/jpeg"}
    media_type = media_map.get(suffix, "image/jpeg")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_data}},
                {"type": "text", "text": HONMA_PROMPT}
            ]
        }]
    )
    return message.content[0].text


def send_to_kakao(text: str) -> bool:
    """카카오톡 나에게 보내기 (REST API)"""
    if not KAKAO_ACCESS_TOKEN:
        print("⚠️  KAKAO_ACCESS_TOKEN 미설정 — 콘솔에만 출력합니다.")
        print(text)
        return False

    url = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
    headers = {
        "Authorization": f"Bearer {KAKAO_ACCESS_TOKEN}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    # 카카오 텍스트 메시지는 최대 9999자
    chunks = [text[i:i+9000] for i in range(0, len(text), 9000)]
    success = True
    for chunk in chunks:
        import json
        payload = {"template_object": json.dumps({"object_type": "text", "text": chunk, "link": {}})}
        resp = requests.post(url, headers=headers, data=payload, timeout=10)
        if resp.status_code != 200:
            print(f"카카오 전송 실패: {resp.status_code} {resp.text}")
            success = False
    return success


class ChartHandler(FileSystemEventHandler):
    def __init__(self):
        self._processing = set()

    def on_created(self, event):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() not in SUPPORTED_EXTS:
            return
        if str(path) in self._processing:
            return

        self._processing.add(str(path))
        print(f"\n📂 새 차트 감지: {path.name}")

        # 파일 쓰기 완료 대기 (스크린샷 저장 중일 수 있음)
        time.sleep(1.5)

        try:
            print("🔍 Claude 분석 중...")
            analysis = analyze_chart(path)

            header = f"📊 차트 분석 완료 — {path.name}\n{'─'*30}\n\n"
            full_text = header + analysis

            print("📱 카카오톡으로 전송 중...")
            if send_to_kakao(full_text):
                print("✅ 카카오톡 전송 완료!")
            else:
                print("❌ 카카오톡 전송 실패 (위 로그 확인)")
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
        finally:
            self._processing.discard(str(path))


def main():
    if not ANTHROPIC_API_KEY:
        print("❌ ANTHROPIC_API_KEY가 .env에 없습니다.")
        sys.exit(1)

    CHART_DIR.mkdir(exist_ok=True)
    print("=" * 50)
    print("📊 Chart-Kakao Analyst 시작")
    print(f"📂 감시 폴더: {CHART_DIR.resolve()}")
    print("💡 이 폴더에 차트 이미지를 저장하면 자동 분석 후 카카오톡으로 전송됩니다.")
    print("=" * 50)

    observer = Observer()
    observer.schedule(ChartHandler(), str(CHART_DIR), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n👋 종료합니다.")
    observer.join()


if __name__ == "__main__":
    main()
