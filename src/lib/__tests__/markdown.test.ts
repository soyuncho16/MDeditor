import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("기본 마크다운을 HTML로 변환한다", async () => {
    const html = await renderMarkdown("# Hello World");
    expect(html).toContain("Hello World</h1>");
    expect(html).toContain("data-source-line=");
  });

  it("GFM 테이블을 렌더링한다", async () => {
    const md = `| A | B |\n|---|---|\n| 1 | 2 |`;
    const html = await renderMarkdown(md);
    expect(html).toContain("<table");
    expect(html).toContain(">1</td>");
  });

  it("GFM 체크박스를 렌더링한다", async () => {
    const md = `- [x] done\n- [ ] todo`;
    const html = await renderMarkdown(md);
    expect(html).toContain('type="checkbox"');
  });

  it("GFM 취소선을 렌더링한다", async () => {
    const md = `~~deleted~~`;
    const html = await renderMarkdown(md);
    expect(html).toContain(">deleted</del>");
  });

  it("인라인 수식을 렌더링한다", async () => {
    const md = `인라인 $E=mc^2$ 수식`;
    const html = await renderMarkdown(md);
    expect(html).toContain("katex");
  });

  it("블록 수식을 렌더링한다", async () => {
    const md = `$$\n\\sum_{i=1}^{n} i\n$$`;
    const html = await renderMarkdown(md);
    expect(html).toContain("katex");
  });

  it("Mermaid 코드 블록을 language-mermaid 클래스로 렌더링한다", async () => {
    const md = "```mermaid\ngraph TD;\n  A-->B;\n```";
    const html = await renderMarkdown(md);
    expect(html).toContain('class="language-mermaid"');
  });

  it("빈 문자열을 처리한다", async () => {
    const html = await renderMarkdown("");
    expect(html).toBe("");
  });
});
