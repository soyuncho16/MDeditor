import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

function rehypeSourceLine() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      const line = node.position?.start?.line;
      if (line != null) {
        node.properties ??= {};
        node.properties["dataSourceLine"] = line;
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeSourceLine)
  .use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
  const result = await processor.process(source);
  return String(result);
}
