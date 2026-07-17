import { useState } from "react";
import MarkdownEditor from "./components/MarkdownEditor";

const sampleMarkdown = `# Welcome to Markdown Editor

A **full-featured** markdown editor with live preview, built from scratch.

## Features

- Live split-pane preview
- Syntax highlighting
- Dark/Light theme
- Export to Markdown/HTML
- Toolbar with formatting buttons

## Code Example

\`\`\`typescript
interface User {
  name: string;
  email: string;
  role: "admin" | "user";
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Tables

| Feature       | Status |
| ------------- | ------ |
| Live Preview  | Done   |
| Dark Mode     | Done   |
| Export        | Done   |
| Code Blocks   | Done   |

## Task List

- [x] Build editor pane
- [x] Build preview pane
- [x] Add toolbar
- [x] Add dark mode
- [ ] Add more themes

## Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

## Links

Check out [GitHub](https://github.com) for more.

---

*Start editing to see the magic happen!*
`;

export default function App() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Markdown Editor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A standalone React component for editing markdown with live preview.
          </p>
        </div>

        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          placeholder="Start writing markdown..."
          height="calc(100vh - 180px)"
        />
      </div>
    </div>
  );
}
