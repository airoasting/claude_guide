#!/usr/bin/env python3
"""
피자 프랜차이즈 대시보드 데이터 생성기.

엑셀(데이터/피자 매장별 실적 데이터.xlsx)을 읽어 dashboard.html 의
`const D = {...}` 객체를 그대로 재생성한다.

집계 규칙(원본 대시보드의 관례를 그대로 따른다):
- 한 (매장, 월) 블록은 6개 카테고리 행으로 구성되며, 매출카테고리 외의
  컬럼(주문수/비용/이익/QSC 등)은 6행에 동일 값이 반복된다.
- 매출액: 카테고리별 값이므로 항상 6행 합산(allrows).
- monthly_total / monthly_pl 의 profit, platform_trend, recent_*:
  원본 관례상 6행을 그대로 합산(allrows = 실제값의 6배).
- kpis / store_kpis / yearly / yearly_kpis 의 profit·orders·신규고객·클레임:
  (매장,월) 단위로 중복 제거 후 합산(dedup, 1배).
- 비율·점수(QSC/리뷰/재방문/채널비중): dedup 평균.

사용법: python3 build_dashboard_data.py            # 검증만
        python3 build_dashboard_data.py --write    # dashboard.html 갱신
"""
import sys, re, json
import pandas as pd

XLSX = '데이터/피자 매장별 실적 데이터.xlsx'
HTML = 'dashboard.html'
STORES = ['광주 충장로점','대구 동성로점','대전 둔산점','부산 서면점','서울 강남점',
          '서울 홍대점','수원 영통점','인천 부평점','제주 연동점']
CATS = ['기타(굿즈/쿠폰)','배달수수료','사이드메뉴','세트메뉴','음료','피자']


def load():
    df = pd.read_excel(XLSX, sheet_name='매출데이터')
    df['ym'] = (df['연도'].astype(int).astype(str) + '-'
                + df['월'].astype(int).map(lambda m: f'{m:02d}'))
    return df


def r1(x):  # 소수 1자리, 파이썬 float 로 변환
    return float(round(float(x), 1))


def r2(x):
    return float(round(float(x), 2))


def store_kpi_row(name, allrows, dedup):
    """allrows / dedup 는 한 매장(또는 매장·연도)으로 필터된 DataFrame.
    margin 은 원본 관례대로 영업이익률(%) 컬럼의 (매장,월) 평균을 쓴다."""
    return {
        'name': name,
        'revenue': int(round(allrows['매출액(만원)'].sum())),
        'profit': int(round(dedup['영업이익(만원)'].sum())),
        'margin': r1(dedup['영업이익률(%)'].mean()),
        'orders': int(round(dedup['총주문건수'].sum())),
        'qsc': r1(dedup['QSC점수'].mean()),
        'review': r2(dedup['리뷰평점'].mean()),
        'revisit': r1(dedup['재방문율'].mean() * 100),
        'new_customers': int(round(dedup['신규고객수'].sum())),
        'claims': int(round(dedup['클레임건수'].sum())),
    }


def channel_row(name, dedup):
    return {
        'store': name,
        'hall': r1(dedup['홀_주문비중'].mean() * 100),
        'delivery': r1(dedup['배달_주문비중'].mean() * 100),
        'takeout': r1(dedup['포장_주문비중'].mean() * 100),
    }


def monthly_pl_block(allrows, dedup, months):
    def s_all(col): return [int(round(allrows[allrows.ym == m][col].sum())) for m in months]
    def s_ded(col): return [int(round(dedup[dedup.ym == m][col].sum())) for m in months]
    return {
        'labels': months,
        'revenue': s_all('매출액(만원)'),
        'food_cost': s_ded('식자재비(만원)'),
        'labor': s_ded('인건비(만원)'),
        'rent': s_ded('임차료(만원)'),
        'platform_fee': s_ded('플랫폼수수료(만원)'),
        'royalty': s_ded('로열티(만원)'),
        'ad_fee': s_ded('광고분담금(만원)'),
        'profit': s_ded('영업이익(만원)'),
    }


def platform_block(allrows, months):
    def s(col): return [int(round(allrows[allrows.ym == m][col].sum())) for m in months]
    return {'labels': months, 'baemin': s('배민_주문수'),
            'coupang': s('쿠팡이츠_주문수'), 'yogiyo': s('요기요_주문수')}


def qsc_block(dedup, months):
    return {'labels': months,
            'qsc': [r1(dedup[dedup.ym == m]['QSC점수'].mean()) for m in months],
            'review': [r2(dedup[dedup.ym == m]['리뷰평점'].mean()) for m in months],
            'revisit': [r1(dedup[dedup.ym == m]['재방문율'].mean() * 100) for m in months]}


def monthly_store_block(allrows, months):
    out = {}
    for st in STORES:
        g = allrows[allrows['매장명'] == st]
        out[st] = {'labels': months,
                   'values': [int(round(g[g.ym == m]['매출액(만원)'].sum())) for m in months]}
    return out


def build(df):
    months = sorted(df['ym'].unique())
    years = sorted(df['연도'].astype(int).unique())
    allrows = df
    dedup = df.groupby(['매장명', 'ym'], as_index=False).first()
    dedup['연도'] = dedup['연도'].astype(int)

    D = {}
    # ── kpis (전체) ──
    rev_tot = int(round(allrows['매출액(만원)'].sum()))
    prof_tot = int(round(dedup['영업이익(만원)'].sum()))
    mt_rev = [int(round(allrows[allrows.ym == m]['매출액(만원)'].sum())) for m in months]
    mt_prof = [int(round(allrows[allrows.ym == m]['영업이익(만원)'].sum())) for m in months]

    # yoy: 마지막 '완전한' 연도(12개월) 대비 그 직전 완전한 연도
    months_per_year = df.groupby(df['연도'].astype(int))['월'].nunique()
    full_years = [y for y in years if months_per_year[y] >= 12]
    if len(full_years) >= 2:
        a, b = full_years[-1], full_years[-2]
        ra = allrows[allrows['연도'] == a]['매출액(만원)'].sum()
        rb = allrows[allrows['연도'] == b]['매출액(만원)'].sum()
        yoy = round((ra / rb - 1) * 100, 1)
    else:
        yoy = 0.0

    D['kpis'] = {
        'total_revenue': rev_tot,
        'total_profit': prof_tot,
        'avg_margin': r1(dedup['영업이익률(%)'].mean()),
        'total_orders': int(round(dedup['총주문건수'].sum())),
        'avg_qsc': r1(dedup['QSC점수'].mean()),
        'avg_review': r2(dedup['리뷰평점'].mean()),
        'yoy_growth': r1(yoy),
        'recent_revenue': int(sum(mt_rev[-3:])),
        'recent_profit': int(sum(mt_prof[-3:])),
    }
    D['stores'] = STORES
    D['categories'] = CATS
    D['dates'] = months
    D['monthly_total'] = {'labels': months, 'revenue': mt_rev, 'profit': mt_prof}
    D['monthly_store'] = monthly_store_block(allrows, months)
    D['store_kpis'] = [store_kpi_row(st, allrows[allrows['매장명'] == st],
                                     dedup[dedup['매장명'] == st]) for st in STORES]
    cr = allrows.groupby('매출카테고리')['매출액(만원)'].sum()
    D['category_revenue'] = {'labels': CATS, 'values': [int(round(cr[c])) for c in CATS]}
    D['channel_mix'] = [channel_row(st, dedup[dedup['매장명'] == st]) for st in STORES]
    D['monthly_pl'] = monthly_pl_block(allrows, dedup, months)
    D['platform_trend'] = platform_block(allrows, months)
    D['qsc_trend'] = qsc_block(dedup, months)

    # ── yearly ──
    D['yearly'] = {
        'labels': years,
        'revenue': [int(round(allrows[allrows['연도'] == y]['매출액(만원)'].sum())) for y in years],
        'profit': [int(round(dedup[dedup['연도'] == y]['영업이익(만원)'].sum())) for y in years],
        'orders': [int(round(dedup[dedup['연도'] == y]['총주문건수'].sum())) for y in years],
    }
    D['yearly_kpis'] = {}
    D['yearly_store_kpis'] = {}
    D['yearly_channel'] = {}
    D['yearly_platform'] = {}
    D['yearly_qsc'] = {}
    D['yearly_pl'] = {}
    D['yearly_monthly_store'] = {}
    for y in years:
        ya = allrows[allrows['연도'] == y]
        yd = dedup[dedup['연도'] == y]
        ymonths = sorted(ya['ym'].unique())
        yr = int(round(ya['매출액(만원)'].sum()))
        yp = int(round(yd['영업이익(만원)'].sum()))
        D['yearly_kpis'][str(y)] = {
            'total_revenue': yr, 'total_profit': yp,
            'avg_margin': r1(yd['영업이익률(%)'].mean()),
            'total_orders': int(round(yd['총주문건수'].sum())),
            'avg_qsc': r1(yd['QSC점수'].mean()),
            'avg_review': r2(yd['리뷰평점'].mean()),
        }
        D['yearly_store_kpis'][str(y)] = [
            store_kpi_row(st, ya[ya['매장명'] == st], yd[yd['매장명'] == st]) for st in STORES]
        D['yearly_channel'][str(y)] = [channel_row(st, yd[yd['매장명'] == st]) for st in STORES]
        D['yearly_platform'][str(y)] = platform_block(ya, ymonths)
        D['yearly_qsc'][str(y)] = qsc_block(yd, ymonths)
        D['yearly_pl'][str(y)] = monthly_pl_block(ya, yd, ymonths)
        D['yearly_monthly_store'][str(y)] = monthly_store_block(ya, ymonths)
    return D


def _clean(o):
    """numpy 스칼라를 파이썬 기본형으로 변환해 json 직렬화가 가능하게 한다."""
    import numpy as np
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, np.floating):
        return float(o)
    return o


def main():
    df = load()
    D = _clean(build(df))
    print(f'총 기간: {D["dates"][0]} ~ {D["dates"][-1]} ({len(D["dates"])}개월), '
          f'연도 {D["yearly"]["labels"]}')
    print('KPIs:', json.dumps(D['kpis'], ensure_ascii=False))
    if '--write' in sys.argv:
        html = open(HTML, encoding='utf-8').read()
        payload = json.dumps(D, ensure_ascii=False, separators=(',', ':'))
        new_html, n = re.subn(r'const D = \{.*?\};\n',
                              'const D = ' + payload + ';\n', html, count=1, flags=re.S)
        assert n == 1, f'D 객체 치환 실패(replacements={n})'
        open(HTML, 'w', encoding='utf-8').write(new_html)
        print('dashboard.html 의 const D 갱신 완료.')
    else:
        print('(미리보기 — 실제 반영하려면 --write 옵션을 붙여 실행)')


if __name__ == '__main__':
    main()
