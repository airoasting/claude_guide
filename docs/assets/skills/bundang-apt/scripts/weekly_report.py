#!/usr/bin/env python3
"""
분당구 아파트 주간 보고서 — Gmail 초안 저장

Usage:
    python scripts/weekly_report.py              # Gmail 초안 생성
    python scripts/weekly_report.py --no-gmail   # 보고서 텍스트만 출력
    python scripts/weekly_report.py --data data/ --min-deals 3

필요 환경변수 (.env):
    GMAIL_CLIENT_ID
    GMAIL_CLIENT_SECRET
    GMAIL_REFRESH_TOKEN
    REPORT_RECIPIENT_EMAIL

Gmail OAuth 초기 설정 (최초 1회):
    python scripts/weekly_report.py --setup-gmail
"""

import io
import os
import sys
import base64
import argparse
from datetime import datetime
from email.mime.text import MIMEText

from dotenv import load_dotenv

if hasattr(sys.stdout, "buffer") and getattr(sys.stdout, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer") and getattr(sys.stderr, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(__file__))
from analyze import run as run_analysis

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ─────────────────────────────────────────────────────────────────
# Gmail 인증
# ─────────────────────────────────────────────────────────────────

def _get_gmail_service():
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        sys.exit(
            "[오류] google-auth / google-api-python-client 미설치\n"
            "  → pip install google-auth google-api-python-client"
        )

    client_id     = os.environ.get("GMAIL_CLIENT_ID", "")
    client_secret = os.environ.get("GMAIL_CLIENT_SECRET", "")
    refresh_token = os.environ.get("GMAIL_REFRESH_TOKEN", "")

    if not all([client_id, client_secret, refresh_token]):
        sys.exit(
            "[오류] .env 파일에 GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN 설정 필요.\n"
            "  최초 1회 설정: python scripts/weekly_report.py --setup-gmail"
        )

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.compose"],
    )
    return build("gmail", "v1", credentials=creds)


def _setup_gmail():
    """최초 1회 OAuth 인증 플로우 실행 → refresh_token 출력."""
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        sys.exit("pip install google-auth-oauthlib 필요")

    creds_path = os.path.join(BASE_DIR, "credentials.json")
    if not os.path.exists(creds_path):
        sys.exit(
            f"[오류] {creds_path} 없음.\n"
            "  Google Cloud Console → OAuth 2.0 클라이언트 ID → JSON 다운로드 후 프로젝트 루트에 저장하세요."
        )

    flow = InstalledAppFlow.from_client_secrets_file(
        creds_path,
        scopes=["https://www.googleapis.com/auth/gmail.compose"],
    )
    creds = flow.run_local_server(port=0)

    print("\n=== Gmail 인증 완료 ===")
    print(f"아래 값을 .env 파일에 복사하세요:\n")
    print(f"GMAIL_CLIENT_ID={creds.client_id}")
    print(f"GMAIL_CLIENT_SECRET={creds.client_secret}")
    print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")


def _create_draft(service, recipient: str, subject: str, html_body: str) -> str:
    message = MIMEText(html_body, "html", "utf-8")
    message["to"]      = recipient
    message["subject"] = subject
    raw   = base64.urlsafe_b64encode(message.as_bytes()).decode()
    draft = service.users().drafts().create(
        userId="me",
        body={"message": {"raw": raw}},
    ).execute()
    return draft["id"]


# ─────────────────────────────────────────────────────────────────
# 보고서 HTML 생성
# ─────────────────────────────────────────────────────────────────

def _pct(v: float) -> str:
    arrow = "▲" if v > 0 else "▼"
    return f"{arrow} {abs(v):.1f}%"


def _color(v: float) -> str:
    return "#16a34a" if v >= 0 else "#dc2626"


def build_report_html(results: dict, report_date: str) -> str:
    df          = results["df"]
    dong_rate   = results["dong_rate"]
    highlight   = results["highlight"]
    top_notable = results["top_notable"]
    dong_notable= results["dong_notable"]

    total_deals = f"{len(df):,}"
    avg_price   = f"{int(df['평당가'].mean()):,}"
    best_row    = dong_rate.loc[dong_rate["변동률_%"].idxmax()]

    # ── 동별 변동률 표 ──
    dong_rows = ""
    for _, r in dong_rate.sort_values("변동률_%", ascending=False).iterrows():
        c = _color(r["변동률_%"])
        dong_rows += (
            f"<tr>"
            f"<td style='padding:7px 14px'>{r['행정동']}</td>"
            f"<td style='padding:7px 14px;text-align:right'>{int(r['평당가_전체평균']):,}만원</td>"
            f"<td style='padding:7px 14px;text-align:right;color:{c};font-weight:700'>{_pct(r['변동률_%'])}</td>"
            f"<td style='padding:7px 14px;text-align:right;color:#64748b'>{int(r['거래건수'])}건</td>"
            f"</tr>"
        )

    # ── 이 달의 거래 ──
    hl_rows = ""
    for _, r in highlight.head(5).iterrows():
        c = _color(r["변동률_%"])
        hl_rows += (
            f"<tr>"
            f"<td style='padding:7px 14px'>{r['행정동']}</td>"
            f"<td style='padding:7px 14px'><strong>{r['단지명']}</strong></td>"
            f"<td style='padding:7px 14px;text-align:right;color:{c};font-weight:700'>{_pct(r['변동률_%'])}</td>"
            f"<td style='padding:7px 14px;text-align:right;color:#7c3aed;font-weight:700'>{r['편차']:.1f}%p</td>"
            f"</tr>"
        )

    # ── 주목할 단지 TOP 5 ──
    notable_rows = ""
    for i, (_, r) in enumerate(top_notable.iterrows(), 1):
        c = _color(r["변동률_%"])
        notable_rows += (
            f"<tr>"
            f"<td style='padding:7px 14px;color:#64748b;font-weight:700'>{i}</td>"
            f"<td style='padding:7px 14px'>{r['행정동']}</td>"
            f"<td style='padding:7px 14px'><strong>{r['단지명']}</strong></td>"
            f"<td style='padding:7px 14px;text-align:right'>{int(r['종합점수'])}점</td>"
            f"<td style='padding:7px 14px;text-align:right'>{int(r['평당가_전체평균']):,}만원</td>"
            f"<td style='padding:7px 14px;text-align:right;color:#7c3aed;font-weight:700'>{r['점수당가격']:.1f}</td>"
            f"<td style='padding:7px 14px;text-align:right;color:{c};font-weight:700'>{_pct(r['변동률_%'])}</td>"
            f"</tr>"
        )

    th_style = "padding:8px 14px;background:#f1f5f9;color:#475569;font-weight:600;text-align:left;border-bottom:2px solid #e2e8f0"
    tbl_style = "width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px"

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Segoe UI',Malgun Gothic,sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:0">
<div style="max-width:700px;margin:0 auto;background:#fff">

  <!-- 헤더 -->
  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:28px 32px">
    <div style="font-size:20px;font-weight:800;margin-bottom:6px">🏢 분당구 아파트 주간 실거래 보고서</div>
    <div style="opacity:.75;font-size:13px">2025.6.15 ~ 2026.6.14 기준 &nbsp;|&nbsp; 발행일: {report_date}</div>
  </div>

  <div style="padding:28px 32px">

    <!-- 요약 카드 -->
    <div style="display:flex;gap:12px;margin-bottom:28px">
      <div style="flex:1;background:#f0f9ff;border-radius:8px;padding:14px 18px">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">총 거래건수</div>
        <div style="font-size:24px;font-weight:800;color:#1e293b;margin-top:4px">{total_deals}건</div>
      </div>
      <div style="flex:1;background:#f0f9ff;border-radius:8px;padding:14px 18px">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">평균 평당가</div>
        <div style="font-size:24px;font-weight:800;color:#1e293b;margin-top:4px">{avg_price}만원</div>
      </div>
      <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:14px 18px">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">최고 상승 동</div>
        <div style="font-size:20px;font-weight:800;color:#15803d;margin-top:4px">{best_row['행정동']} {best_row['변동률_%']:+.1f}%</div>
      </div>
    </div>

    <!-- 동별 변동률 -->
    <h2 style="font-size:15px;font-weight:700;color:#334155;border-left:4px solid #2563eb;padding-left:10px;margin-bottom:14px">
      동별 평당가 변동률 (전반기→후반기)
    </h2>
    <table style="{tbl_style}">
      <thead><tr>
        <th style="{th_style}">동</th>
        <th style="{th_style};text-align:right">평균 평당가</th>
        <th style="{th_style};text-align:right">변동률</th>
        <th style="{th_style};text-align:right">거래건수</th>
      </tr></thead>
      <tbody>{dong_rows}</tbody>
    </table>

    <!-- 이 달의 거래 -->
    <h2 style="font-size:15px;font-weight:700;color:#334155;border-left:4px solid #7c3aed;padding-left:10px;margin-bottom:14px">
      이 달의 거래 — 동 평균 대비 최대 편차 단지 (TOP 5)
    </h2>
    <table style="{tbl_style}">
      <thead><tr>
        <th style="{th_style}">동</th>
        <th style="{th_style}">단지명</th>
        <th style="{th_style};text-align:right">변동률</th>
        <th style="{th_style};text-align:right">동 평균 편차</th>
      </tr></thead>
      <tbody>{hl_rows}</tbody>
    </table>

    <!-- 주목할 단지 -->
    <h2 style="font-size:15px;font-weight:700;color:#334155;border-left:4px solid #16a34a;padding-left:10px;margin-bottom:14px">
      주목할 단지 TOP 5 — 점수 대비 저평가
    </h2>
    <table style="{tbl_style}">
      <thead><tr>
        <th style="{th_style}">#</th>
        <th style="{th_style}">동</th>
        <th style="{th_style}">단지명</th>
        <th style="{th_style};text-align:right">종합점수</th>
        <th style="{th_style};text-align:right">평당가</th>
        <th style="{th_style};text-align:right">점수당가격↑</th>
        <th style="{th_style};text-align:right">변동률</th>
      </tr></thead>
      <tbody>{notable_rows}</tbody>
    </table>

    <!-- 대출 기준 안내 -->
    <div style="background:#fef9c3;border-radius:8px;padding:16px 20px;font-size:12px;color:#713f12;line-height:1.8">
      <strong>💡 대출 한도 기준 (투기과열지구·조정대상지역·토지거래허가구역, 2025.10.16~)</strong><br>
      · 매매가 15억 이하 → 최대 대출 <strong>6억원</strong><br>
      · 매매가 15~25억 → 최대 대출 <strong>4억원</strong><br>
      · 매매가 25억 초과 → 최대 대출 <strong>2억원</strong><br>
      · 최소 자기자본 = 매매가 − 대출한도 + 부대비용(약 1.5%)
    </div>

  </div><!-- /padding -->

  <!-- 푸터 -->
  <div style="background:#f1f5f9;padding:16px 32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0">
    본 보고서는 국토교통부 실거래가 공개시스템 데이터 기반 자동 분석 결과입니다.
    투자 결정은 반드시 공인중개사와 추가 검토 후 진행하십시오.
  </div>

</div>
</body>
</html>"""
    return html


# ─────────────────────────────────────────────────────────────────
# main
# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="분당구 아파트 주간 보고서 Gmail 초안 저장")
    parser.add_argument("--data",       default=os.path.join(BASE_DIR, "data"))
    parser.add_argument("--min-deals",  type=int, default=5)
    parser.add_argument("--top-n",      type=int, default=5)
    parser.add_argument("--no-gmail",   action="store_true", help="Gmail 없이 HTML만 출력")
    parser.add_argument("--setup-gmail",action="store_true", help="최초 Gmail OAuth 인증 설정")
    args = parser.parse_args()

    load_dotenv(os.path.join(BASE_DIR, ".env"))

    if args.setup_gmail:
        _setup_gmail()
        return

    results     = run_analysis(args.data, args.min_deals, args.top_n)
    report_date = datetime.now().strftime("%Y-%m-%d")
    html_body   = build_report_html(results, report_date)

    if args.no_gmail:
        print(html_body)
        return

    recipient = os.environ.get("REPORT_RECIPIENT_EMAIL", "")
    if not recipient:
        print("[경고] REPORT_RECIPIENT_EMAIL 미설정. HTML 보고서를 stdout에 출력합니다.\n")
        print(html_body)
        return

    service  = _get_gmail_service()
    subject  = f"[분당구] 아파트 주간 실거래 보고서 {report_date}"
    draft_id = _create_draft(service, recipient, subject, html_body)

    print(f"\n[완료] Gmail 초안 생성 완료")
    print(f"  수신: {recipient}")
    print(f"  제목: {subject}")
    print(f"  Draft ID: {draft_id}")
    print(f"  → Gmail 받은편지함에서 임시보관함(Drafts)을 확인하세요.")


if __name__ == "__main__":
    main()
