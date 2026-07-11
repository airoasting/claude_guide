// Claude API 응답 파싱 (web_search 혼재 응답 처리)
export function parseNewsResponse(content) {
  // 1. text 블록에서 JSON 추출
  const textBlocks = content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const cleaned = textBlocks.replace(/```json\n?|```/g, '').trim();

  let news;
  try {
    news = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    try {
      news = match ? JSON.parse(match[0]) : null;
    } catch {
      news = null;
    }
  }

  // 2. source_url 누락 시 tool_result에서 URL 매칭
  if (news?.[0] && !news[0].source_url) {
    const toolResults = content
      .filter((b) => b.type === 'tool_result' || b.type === 'web_search_tool_result')
      .flatMap((b) => {
        try {
          return JSON.parse(b.content?.[0]?.text || '[]');
        } catch {
          return [];
        }
      });
    news.forEach((item) => {
      const match = toolResults.find(
        (r) =>
          r.url &&
          (r.title?.includes(item.headline?.slice(0, 6)) ||
            item.headline?.includes(r.title?.slice(0, 6)))
      );
      if (match) item.source_url = match.url;
    });
  }

  return news || [];
}

// Claude 텍스트 블록 추출
export function extractText(content) {
  return content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
