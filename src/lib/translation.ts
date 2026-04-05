export interface CodeBlockResult {
  text: string;
  blocks: string[];
}

export function extractCodeBlocks(markdown: string): CodeBlockResult {
  const blocks: string[] = [];

  // 펜스 코드 블록 먼저 추출
  let text = markdown.replace(/```[\s\S]*?```/g, (match) => {
    const index = blocks.length;
    blocks.push(match);
    return `{{CODE_BLOCK_${index}}}`;
  });

  // 인라인 코드 추출
  text = text.replace(/`[^`]+`/g, (match) => {
    const index = blocks.length;
    blocks.push(match);
    return `{{CODE_BLOCK_${index}}}`;
  });

  return { text, blocks };
}

export function restoreCodeBlocks(
  translated: string,
  blocks: string[],
): string {
  let result = translated;
  blocks.forEach((block, index) => {
    result = result.replace(`{{CODE_BLOCK_${index}}}`, block);
  });
  return result;
}

export function buildTranslationPrompt(sourceLang: string): string {
  const langName = sourceLang === "en" ? "영어" : "중국어";
  return `당신은 ${langName}를 한국어로 번역하는 전문 번역가입니다.

규칙:
1. 마크다운 서식(제목, 목록, 링크 등)은 그대로 유지하세요.
2. {{CODE_BLOCK_N}} 형태의 플레이스홀더는 절대 번역하지 말고 그대로 두세요.
3. 대명사, 고유명사, 기술 용어(예: React, TypeScript, API, GitHub 등)는 원문 그대로 유지하세요.
4. 자연스러운 한국어로 번역하세요.
5. 번역 결과만 출력하세요. 설명이나 부가 텍스트를 추가하지 마세요.`;
}

export interface OllamaStatus {
  connected: boolean;
  models: string[];
}

export async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    if (!response.ok) return { connected: false, models: [] };
    const data = await response.json();
    const models = (data.models ?? []).map(
      (m: { name: string }) => m.name,
    );
    return { connected: true, models };
  } catch {
    return { connected: false, models: [] };
  }
}

export async function translateWithOllama(
  markdown: string,
  sourceLang: string,
  model: string = "gemma3:4b",
  onAbort?: AbortSignal,
): Promise<string> {
  const { text, blocks } = extractCodeBlocks(markdown);
  const systemPrompt = buildTranslationPrompt(sourceLang);

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: text,
      stream: false,
    }),
    signal: onAbort,
  });

  if (!response.ok) {
    throw new Error(`Ollama API 오류: ${response.status}`);
  }

  const data = await response.json();
  const translated = data.response ?? "";

  return restoreCodeBlocks(translated, blocks);
}
