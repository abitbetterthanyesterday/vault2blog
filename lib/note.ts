import { parseYAML, stringify, z } from "./deps.ts";

import { blogSchema } from "./schema.ts";

export interface NoteProps {
  filePath: string;
}
export type Frontmatter = z.infer<typeof blogSchema>;

/**
 * Class representing the parsed version of a note.
 */
export class Note {
  readonly filePath: string;
  readonly originalFile: string;
  readonly frontmatter: Frontmatter | null;
  readonly originalFrontmatter: string | null;

  /**
   * Create a note
   * @param filePath the path of file
   * @param handlers an array of handler to execute when processing the note
   * @param onCreatedNote a hook to run a function on note creation
   */
  constructor(
    filePath: string,
  ) {
    this.filePath = filePath;
    this.originalFile = Deno.readTextFileSync(filePath);
    this.frontmatter = this.parseFrontmatter();
    this.originalFrontmatter = this.getRawFrontMatter();
  }
  /**
   * Return the raw content of the note, as is.
   * This does not include frontmatter.
   */
  public get originalContent(): string | null {
    try {
      return this.originalFile.split("---")[2].trim();
    } catch {
      return null;
    }
  }

  public processedFile(): string | null {
    if (!this.parseFrontmatter()) {
      return null;
    }
    if (!this.frontmatter) {
      return null;
    }
    try {
      const frontmatter = stringify(this.frontmatter);
      const content = "";
      return `---
${frontmatter}
--- 
${content}`;
    } catch (e) {
      console.log(`${this.frontmatter.title} failed to process`, e);
      return null;
    }
  }

  /**
   *  Parse the file frontmatter. Returns null if there is no frontmatter
   *  @private
   */
  private parseFrontmatter(): Frontmatter | null {
    try {
      const rawFrontmatter = this.getRawFrontMatter();
      const frontmatter = parseYAML(rawFrontmatter) as Frontmatter;
      return {
        ...frontmatter,
        last_modified_at: new Date(frontmatter.last_modified_at),
        created_at: new Date(frontmatter.created_at),
      };
    } catch {
      return null;
    }
  }

  private getRawFrontMatter() {
    return this.originalFile.split("---")[1] as string;
  }
}
