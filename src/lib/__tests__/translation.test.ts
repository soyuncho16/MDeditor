import { describe, it, expect } from "vitest";
import {
  extractCodeBlocks,
  restoreCodeBlocks,
  buildTranslationPrompt,
} from "../translation";

describe("extractCodeBlocks", () => {
  it("펜스 코드 블록을 플레이스홀더로 치환한다", () => {
    const md = "텍스트\n```js\nconst x = 1;\n```\n끝";
    const { text, blocks } = extractCodeBlocks(md);
    expect(text).toContain("{{CODE_BLOCK_0}}");
    expect(text).not.toContain("const x = 1");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain("```js");
  });

  it("인라인 코드를 플레이스홀더로 치환한다", () => {
    const md = "변수 `foo`를 사용한다";
    const { text, blocks } = extractCodeBlocks(md);
    expect(text).toContain("{{CODE_BLOCK_0}}");
    expect(blocks[0]).toBe("`foo`");
  });

  it("여러 코드 블록을 순서대로 치환한다", () => {
    const md = "`a` 텍스트 `b` 텍스트\n```\ncode\n```";
    const { text, blocks } = extractCodeBlocks(md);
    expect(blocks).toHaveLength(3);
    expect(text).toContain("{{CODE_BLOCK_0}}");
    expect(text).toContain("{{CODE_BLOCK_1}}");
    expect(text).toContain("{{CODE_BLOCK_2}}");
  });

  it("코드 블록이 없으면 원문 그대로 반환한다", () => {
    const md = "그냥 텍스트";
    const { text, blocks } = extractCodeBlocks(md);
    expect(text).toBe("그냥 텍스트");
    expect(blocks).toHaveLength(0);
  });
});

describe("restoreCodeBlocks", () => {
  it("플레이스홀더를 원래 코드 블록으로 복원한다", () => {
    const translated = "텍스트 {{CODE_BLOCK_0}} 끝";
    const blocks = ["```js\nconst x = 1;\n```"];
    const result = restoreCodeBlocks(translated, blocks);
    expect(result).toBe("텍스트 ```js\nconst x = 1;\n``` 끝");
  });
});

describe("buildTranslationPrompt", () => {
  it("시스템 프롬프트에 대명사/고유명사 유지 지시가 포함된다", () => {
    const prompt = buildTranslationPrompt("en");
    expect(prompt).toContain("고유명사");
    expect(prompt).toContain("대명사");
  });
});
