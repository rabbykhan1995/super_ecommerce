import { visit } from "unist-util-visit";

export function remarkAdmonition() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === "containerDirective") {
        const directiveName = node.name;

        node.type = "mdxJsxFlowElement";
        node.name = "admonition";
        node.attributes = [
          {
            type: "mdxJsxAttribute",
            name: "type",
            value: directiveName,
          },
        ];
      }
    });
  };
}
