"""
AGT 3 — 디자이너 에이전트
콘텐츠 JSON을 받아 링고브릿지 HRD 브랜드 디자인 시스템이 적용된 HTML을 생성한다.
"""

from datetime import datetime
from pathlib import Path

TEMPLATE_PATH = Path(__file__).parent.parent.parent / "issue-01.html"


def run_designer(issue_num: int, date: datetime, content: dict) -> str:
    """콘텐츠 JSON → 발행 가능한 HTML 문자열 반환"""

    recommended = next(
        (c["title"] for c in content["subject_candidates"] if c.get("recommended")),
        content["subject_candidates"][0]["title"],
    )

    trend = content["trend"]
    worry = content["worry"]
    english = content["english"]

    trend_cards_html = "\n".join(
        f"""        <div class="trend-card">
          <div class="trend-card-num">{c['num']}</div>
          <div class="trend-card-title">{c['title']}</div>
          <div class="trend-card-body">{c['body']}</div>
        </div>"""
        for c in trend["cards"]
    )

    reasons_html = "\n".join(
        f"""        <div class="reason-item">
          <div class="reason-num">{r['num']}</div>
          <div class="reason-content">
            <div class="reason-title">{r['title']}</div>
            <div class="reason-body">{r['body']}</div>
          </div>
        </div>"""
        for r in worry["reasons"]
    )

    bullets_html = "\n".join(
        f'          <li>{b}</li>' for b in worry["solution_bullets"]
    )

    examples_html = "\n".join(
        f"""      <div class="example-item">
        <div class="example-sit">{e['situation']}</div>
        <div class="example-en">"{e['en']}"</div>
        <div class="example-ko">{e['ko']}</div>
      </div>"""
        for e in english["examples"]
    )

    # 타이틀에서 accent 단어 강조
    def accent_title(title: str, word: str) -> str:
        if word and word in title:
            return title.replace(word, f'<span class="accent">{word}</span>', 1)
        return title

    trend_title_html = accent_title(trend["section_title"], trend.get("accent_word", ""))
    worry_title_html = accent_title(worry["section_title"], worry.get("accent_word", ""))

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LingoBridge HRD Brief — Vol.{issue_num:02d}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700;800;900&family=IBM+Plex+Mono:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<style>
:root {{
  --c-bg:        #fafaf6;
  --c-bg-alt:    #f0efe8;
  --c-bg-orange: #f5c842;
  --c-fg:        #1e1c18;
  --c-fg-2:      #4a4840;
  --c-fg-3:      #8a8878;
  --c-fg-light:  #1e1c18;
  --c-accent:    #f5c842;
  --c-border:    #e0ddd4;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #ebe9e0; font-family: 'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif; color: var(--c-fg); -webkit-font-smoothing: antialiased; }}
.email-outer {{ max-width: 680px; margin: 0 auto; padding: 40px 16px 80px; }}
.header {{ background: #2c2c2a; border: 1px solid #2c2c2a; border-bottom: none; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }}
.header-logo {{ font-family: 'Barlow', sans-serif; font-weight: 900; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: #f0ece5; }}
.header-logo span {{ color: var(--c-accent); }}
.header-meta {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: #888880; text-transform: uppercase; }}
.cover {{ background: var(--c-bg-orange); padding: 52px 40px 44px; }}
.cover-kicker {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.55); margin-bottom: 20px; }}
.cover-title {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 52px; line-height: 0.92; letter-spacing: -0.03em; color: var(--c-fg-light); margin-bottom: 24px; word-break: keep-all; }}
.cover-lead {{ font-size: 15px; line-height: 1.6; color: rgba(17,17,17,0.65); max-width: 80%; word-break: keep-all; }}
.cover-foot {{ margin-top: 36px; padding-top: 16px; border-top: 1px solid rgba(17,17,17,0.18); display: flex; justify-content: space-between; align-items: center; }}
.cover-foot-name {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,17,17,0.5); }}
.cover-read-time {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,17,17,0.4); }}
.body-wrap {{ background: var(--c-bg); border: 1px solid var(--c-border); border-top: none; }}
.greeting {{ padding: 36px 40px; border-bottom: 1px solid var(--c-border); }}
.greeting p {{ font-size: 15px; line-height: 1.9; color: var(--c-fg-2); word-break: keep-all; margin-bottom: 10px; }}
.section {{ padding: 40px 40px; border-bottom: 1px solid var(--c-border); }}
.section-chrome {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; padding-bottom: 14px; border-bottom: 1px solid var(--c-border); }}
.section-kicker {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-accent); }}
.section-num {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: var(--c-fg-3); }}
.rule {{ width: 36px; height: 2px; background: var(--c-accent); margin-bottom: 18px; }}
.section-title {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.1; letter-spacing: -0.02em; color: var(--c-fg); margin-bottom: 20px; word-break: keep-all; }}
.section-title .accent {{ color: var(--c-accent); }}
.body-text {{ font-size: 15px; line-height: 1.9; color: var(--c-fg-2); word-break: keep-all; margin-bottom: 16px; }}
.trend-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--c-border); border: 1px solid var(--c-border); margin: 24px 0; }}
.trend-card {{ background: var(--c-bg-alt); padding: 20px 22px; }}
.trend-card-num {{ font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-accent); margin-bottom: 8px; }}
.trend-card-title {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; color: var(--c-fg); margin-bottom: 8px; }}
.trend-card-body {{ font-size: 13px; line-height: 1.75; color: var(--c-fg-2); word-break: keep-all; }}
.source-line {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--c-fg-3); margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--c-border); }}
.quote-block {{ padding: 24px 26px 24px 30px; border-left: 3px solid var(--c-accent); background: var(--c-bg-alt); margin: 24px 0; }}
.quote-mark {{ font-family: 'Barlow', sans-serif; font-weight: 900; font-size: 60px; line-height: 0.6; color: var(--c-accent); margin-bottom: 10px; display: block; }}
.quote-text {{ font-size: 15px; line-height: 1.85; color: var(--c-fg); word-break: keep-all; }}
.reason-list {{ display: flex; flex-direction: column; gap: 1px; background: var(--c-border); border: 1px solid var(--c-border); margin: 24px 0; }}
.reason-item {{ background: var(--c-bg-alt); padding: 20px 22px; display: flex; gap: 18px; }}
.reason-num {{ font-family: 'Barlow', sans-serif; font-weight: 900; font-size: 28px; line-height: 1; color: var(--c-accent); min-width: 28px; margin-top: 2px; }}
.reason-content {{ flex: 1; }}
.reason-title {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 14px; color: var(--c-fg); margin-bottom: 6px; }}
.reason-body {{ font-size: 14px; line-height: 1.85; color: var(--c-fg-2); word-break: keep-all; }}
.solution-box {{ background: var(--c-bg-orange); padding: 26px 28px; margin: 24px 0; }}
.solution-kicker {{ font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.45); margin-bottom: 14px; }}
.solution-body {{ font-size: 14px; line-height: 1.85; color: var(--c-fg-light); word-break: keep-all; margin-bottom: 12px; }}
.bullet-list {{ list-style: none; margin: 10px 0; display: flex; flex-direction: column; gap: 6px; }}
.bullet-list li {{ font-size: 14px; line-height: 1.7; color: rgba(17,17,17,0.75); padding-left: 16px; position: relative; word-break: keep-all; }}
.bullet-list li::before {{ content: '/'; font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: var(--c-fg-light); position: absolute; left: 0; }}
.hb-connect {{ background: var(--c-bg-alt); border-left: 2px solid var(--c-accent); padding: 20px 24px; margin-top: 20px; }}
.hb-connect p {{ font-size: 14px; line-height: 1.85; color: var(--c-fg-2); word-break: keep-all; }}
.hb-connect p strong {{ color: var(--c-accent); font-weight: 600; }}
.section-orange {{ background: var(--c-bg-orange); padding: 40px 40px; border-bottom: 1px solid rgba(17,17,17,0.12); }}
.section-chrome-orange {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; padding-bottom: 14px; border-bottom: 1px solid rgba(17,17,17,0.15); }}
.kicker-orange {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.45); }}
.num-orange {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: rgba(17,17,17,0.3); }}
.rule-dark {{ width: 36px; height: 2px; background: var(--c-fg-light); margin-bottom: 18px; opacity: 0.25; }}
.section-title-dark {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.1; letter-spacing: -0.02em; color: var(--c-fg-light); margin-bottom: 20px; word-break: keep-all; }}
.body-text-dark {{ font-size: 15px; line-height: 1.9; color: rgba(17,17,17,0.75); word-break: keep-all; margin-bottom: 16px; }}
.expression-display {{ text-align: center; padding: 32px 24px; border: 1px solid rgba(17,17,17,0.15); margin: 20px 0; }}
.expression-phrase {{ font-family: 'Barlow', sans-serif; font-weight: 900; font-size: 32px; letter-spacing: -0.02em; color: var(--c-fg-light); margin-bottom: 8px; line-height: 1; }}
.expression-meaning {{ font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: rgba(17,17,17,0.45); text-transform: uppercase; }}
.example-list {{ display: flex; flex-direction: column; gap: 1px; background: rgba(17,17,17,0.15); border: 1px solid rgba(17,17,17,0.15); margin: 20px 0; }}
.example-item {{ background: rgba(17,17,17,0.06); padding: 18px 20px; }}
.example-sit {{ font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.35); margin-bottom: 8px; }}
.example-en {{ font-family: 'Barlow', sans-serif; font-weight: 700; font-size: 14px; color: var(--c-fg-light); line-height: 1.5; margin-bottom: 4px; }}
.example-ko {{ font-size: 12px; color: rgba(17,17,17,0.5); line-height: 1.6; }}
.tip-box {{ background: rgba(17,17,17,0.08); padding: 16px 18px; margin-top: 12px; }}
.tip-label {{ font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.35); margin-bottom: 6px; }}
.tip-body {{ font-size: 14px; line-height: 1.8; color: rgba(17,17,17,0.78); word-break: keep-all; }}
.tip-body strong {{ color: var(--c-fg-light); font-weight: 700; }}
.cta-section {{ background: #2c2c2a; padding: 44px 40px; border-bottom: none; text-align: center; }}
.cta-title {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 22px; line-height: 1.3; letter-spacing: -0.02em; color: #f0ece5; margin-bottom: 10px; word-break: keep-all; }}
.cta-title .accent {{ color: var(--c-accent); }}
.cta-sub {{ font-size: 13px; color: #888880; margin-bottom: 28px; }}
.cta-btn {{ display: inline-block; background: var(--c-accent); color: #1e1c18; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 28px; text-decoration: none; }}
.footer {{ background: #2c2c2a; border: 1px solid #2c2c2a; border-top: 1px solid #3a3836; padding: 32px 40px; }}
.footer-top {{ display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #3a3836; }}
.footer-name {{ font-family: 'Barlow', 'Noto Sans KR', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -0.02em; color: #f0ece5; margin-bottom: 4px; }}
.footer-title {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; color: #888880; }}
.footer-contacts {{ text-align: right; display: flex; flex-direction: column; gap: 3px; }}
.footer-contacts a {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #888880; text-decoration: none; }}
.footer-bottom {{ font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #505048; line-height: 1.7; }}
.footer-bottom a {{ color: var(--c-accent); text-decoration: none; }}
@media (max-width: 520px) {{
  .cover-title {{ font-size: 36px; }}
  .section-title, .section-title-dark {{ font-size: 22px; }}
  .trend-grid {{ grid-template-columns: 1fr; }}
  .section, .section-orange, .greeting, .cta-section, .footer {{ padding-left: 24px; padding-right: 24px; }}
  .cover {{ padding: 36px 24px 32px; }}
  .header {{ padding: 18px 24px; }}
  .footer-top {{ flex-direction: column; gap: 16px; }}
  .footer-contacts {{ text-align: left; }}
}}
</style>
</head>
<body>
<div class="email-outer">
  <div class="header">
    <div class="header-logo">LingoBridge <span>HRD</span> Brief</div>
    <div class="header-meta">Vol.{issue_num:02d} · {date.strftime('%Y.%m.%d')}</div>
  </div>
  <div class="cover">
    <div class="cover-kicker">이번 주 고민 해결소</div>
    <div class="cover-title">{content["subject_candidates"][0]["title"].replace(", ", ",<br>").replace("왜 ", "왜<br>")}</div>
    <div class="cover-lead">{content["worry"]["quote"][:60]}...</div>
    <div class="cover-foot">
      <div class="cover-foot-name">Leona Kim · 링고브릿지 HRD</div>
      <div class="cover-read-time">읽기 약 4분</div>
    </div>
  </div>
  <div class="body-wrap">
    <div class="greeting">
      <p>{content["greeting"]}</p>
    </div>
    <div class="section">
      <div class="section-chrome">
        <span class="section-kicker">글로벌 HRD 트렌드</span>
        <span class="section-num">01</span>
      </div>
      <div class="rule"></div>
      <div class="section-title">{trend_title_html}</div>
      <p class="body-text">{trend["body"]}</p>
      <div class="trend-grid">
{trend_cards_html}
      </div>
      <p class="body-text">{trend["closing"]}</p>
      <div class="source-line">출처: {trend["source"]}</div>
    </div>
    <div class="section">
      <div class="section-chrome">
        <span class="section-kicker">이번 주 고민 해결소</span>
        <span class="section-num">02</span>
      </div>
      <div class="rule"></div>
      <div class="section-title">{worry_title_html}</div>
      <div class="quote-block">
        <span class="quote-mark">"</span>
        <p class="quote-text">{worry["quote"]}</p>
      </div>
      <p class="body-text">{worry["intro"]}</p>
      <div class="reason-list">
{reasons_html}
      </div>
      <div class="solution-box">
        <div class="solution-kicker">지금 바로 해볼 수 있는 것</div>
        <p class="solution-body">{worry["solution_intro"]}</p>
        <ul class="bullet-list">
{bullets_html}
        </ul>
        <p class="solution-body" style="margin-top:12px">{worry["solution_closing"]}</p>
      </div>
      <div class="hb-connect">
        <p><strong>링고브릿지에서는</strong> {worry["brand_connect"]}</p>
      </div>
    </div>
  </div>
  <div class="section-orange">
    <div class="section-chrome-orange">
      <span class="kicker-orange">오늘의 영어 표현</span>
      <span class="num-orange">03</span>
    </div>
    <div class="rule-dark"></div>
    <div class="section-title-dark">{english["section_title"]}</div>
    <div class="expression-display">
      <div class="expression-phrase">"{english["phrase"]}"</div>
      <div class="expression-meaning">{english["meaning_ko"]}</div>
    </div>
    <p class="body-text-dark">{english["intro"]}</p>
    <div class="example-list">
{examples_html}
    </div>
    <div class="tip-box">
      <div class="tip-label">핵심 팁</div>
      <div class="tip-body">{english["tip"]}</div>
    </div>
  </div>
  <div class="body-wrap" style="border-top:none">
    <div class="cta-section">
      <div class="cta-title">이 고민, 우리 회사 얘기 같으시다면<br><span class="accent">이 메일에 바로 답장 주세요.</span></div>
      <div class="cta-sub">Leona가 직접 읽습니다.</div>
      <a class="cta-btn" href="mailto:leona@lingobridge.co.kr?subject=뉴스레터 {issue_num:02d}호 관련 문의">leona@lingobridge.co.kr →</a>
    </div>
    <div class="footer">
      <div class="footer-top">
        <div>
          <div class="footer-name">Leona Kim</div>
          <div class="footer-title">CEO · 링고브릿지 HRD</div>
        </div>
        <div class="footer-contacts">
          <a href="mailto:leona@lingobridge.co.kr">leona@lingobridge.co.kr</a>
          <a href="tel:0255414100">02-541-4100</a>
          <a href="https://www.lingobridge.co.kr">www.lingobridge.co.kr</a>
        </div>
      </div>
      <div class="footer-bottom">
        서울시 강남구 테헤란로 87길 22 도심공항터미널 2층 205호<br>
        이 메일은 링고브릿지 HRD 뉴스레터를 구독하신 분들께 발송됩니다.
        수신을 원하지 않으시면 <a href="mailto:leona@lingobridge.co.kr?subject=수신거부">여기</a>로 알려주세요.
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

    return html
