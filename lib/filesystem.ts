import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const WORKSPACE = process.env.WORKSPACE_PATH || "/Users/middletonbot/Documents/Obsidian Vault/Marlowe";
const TODAY_PATH = process.env.TODAY_MD_PATH || "/Users/middletonbot/life/today.md";

// --- Security ---

function safePath(relativePath: string, root: string = WORKSPACE): string {
  // Strip leading slashes so path.resolve treats it as relative to root
  const clean = relativePath.replace(/^\/+/, "");
  const resolved = path.resolve(root, clean);
  if (!resolved.startsWith(root)) {
    throw new Error("Path traversal blocked");
  }
  return resolved;
}

// --- Types ---

export interface FileEntry {
  name: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  extension?: string;
}

export interface TodaySection {
  title: string;
  emoji?: string;
  tasks: TodayTask[];
}

export interface TodayTask {
  text: string;
  done: boolean;
  inProgress: boolean;
  raw: string;
  lineIndex: number;
}

export interface TodayData {
  heading: string;
  sections: TodaySection[];
}

// --- Directory Listing ---

export async function listDirectory(relativePath: string = "/"): Promise<FileEntry[]> {
  const dirPath = safePath(relativePath);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: FileEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dirPath, entry.name);
    try {
      const stat = await fs.stat(fullPath);
      results.push({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
        size: stat.size,
        modified: stat.mtime.toISOString(),
        extension: entry.isDirectory() ? undefined : path.extname(entry.name).slice(1).toLowerCase(),
      });
    } catch {
      // skip files we can't stat
    }
  }

  results.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return results;
}

// --- File Read ---

export async function readFile(relativePath: string): Promise<{ content: string; size: number; modified: string }> {
  const filePath = safePath(relativePath);
  const [content, stat] = await Promise.all([
    fs.readFile(filePath, "utf-8"),
    fs.stat(filePath),
  ]);
  return { content, size: stat.size, modified: stat.mtime.toISOString() };
}

// --- File Write (upload) ---

export async function writeFile(relativePath: string, content: Buffer | string): Promise<void> {
  const filePath = safePath(relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

// --- File Download Stream ---

export function getFilePath(relativePath: string): string {
  return safePath(relativePath);
}

export function fileExists(relativePath: string): boolean {
  try {
    const filePath = safePath(relativePath);
    return fsSync.existsSync(filePath);
  } catch {
    return false;
  }
}

// --- Create Directory ---

export async function createDirectory(relativePath: string): Promise<void> {
  const dirPath = safePath(relativePath);
  await fs.mkdir(dirPath, { recursive: true });
}

// --- Today.md Parser ---

export async function readTodayMd(): Promise<TodayData> {
  const raw = await fs.readFile(TODAY_PATH, "utf-8");
  const lines = raw.split("\n");

  let heading = "";
  const sections: TodaySection[] = [];
  let currentSection: TodaySection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main heading: ## TODAY — 2026-02-26 (Thu) — ...
    if (line.startsWith("## TODAY")) {
      heading = line.replace(/^##\s*/, "").trim();
      continue;
    }

    // Section heading: ### 🔴 PRIORITY (do these or the day fails)
    if (line.startsWith("### ") && currentSection !== null || line.startsWith("### ")) {
      const match = line.match(/^###\s+(\S+)\s+(.+)/);
      if (match) {
        currentSection = {
          emoji: match[1],
          title: match[2].replace(/\(.*\)/, "").trim(),
          tasks: [],
        };
        sections.push(currentSection);
      }
      continue;
    }

    // Task: - [ ] text / - [x] text / - [~] text
    if (currentSection && /^- \[[ x~]\]/.test(line)) {
      const done = line.includes("[x]");
      const inProgress = line.includes("[~]");
      const text = line.replace(/^- \[[ x~]\]\s*/, "").trim();
      currentSection.tasks.push({ text, done, inProgress, raw: line, lineIndex: i });
    }
  }

  return { heading, sections };
}

// --- Today.md Task Toggle ---

export async function toggleTodayTask(lineIndex: number, done: boolean): Promise<void> {
  const raw = await fs.readFile(TODAY_PATH, "utf-8");
  const lines = raw.split("\n");

  if (lineIndex < 0 || lineIndex >= lines.length) {
    throw new Error("Invalid line index");
  }

  const line = lines[lineIndex];
  if (done) {
    lines[lineIndex] = line.replace("[ ]", "[x]").replace("[~]", "[x]");
  } else {
    lines[lineIndex] = line.replace("[x]", "[ ]");
  }

  await fs.writeFile(TODAY_PATH, lines.join("\n"));
}

// --- Today.md Add Task ---

export async function addTodayTask(text: string, section: string = "NORMAL"): Promise<void> {
  const raw = await fs.readFile(TODAY_PATH, "utf-8");
  const lines = raw.split("\n");

  // Find the target section
  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("### ") && lines[i].toUpperCase().includes(section.toUpperCase())) {
      // Find end of this section (next ### or ## or ---)
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith("### ") && !lines[j].startsWith("## ") && !lines[j].startsWith("---")) {
        j++;
      }
      insertAt = j;
      break;
    }
  }

  if (insertAt === -1) {
    // Append to end if section not found
    lines.push(`- [ ] ${text}`);
  } else {
    lines.splice(insertAt, 0, `- [ ] ${text}`);
  }

  await fs.writeFile(TODAY_PATH, lines.join("\n"));
}
