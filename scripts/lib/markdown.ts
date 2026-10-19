/**
 * Plain text <-> Markdown for the game descriptions (game.description_md).
 */

// Markdown special characters, so that the text renders as it is
export const escapeMarkdown = (text: string) =>
  text
    .replace(/([\\`*_[\]<>])/g, `\\$1`)
    .replace(/^(\s*)([#>+-])(\s)/gm, `$1\\$2$3`)
    // "1924. Le détective…" is not an ordered list
    .replace(/^(\s*)(\d+)([.)])(\s)/gm, `$1$2\\$3$4`);

/**
 * Text of a description made of a single plain paragraph, undefined when it
 * has formatting (headings, emphasis, links, lists) or several paragraphs.
 */
export function plainParagraph(markdown: string) {
  if (!markdown || markdown.includes(`\n\n`)) return undefined;
  const unescaped = markdown.replace(/\\([\\`*_[\]<>#+\-.)])/g, ``);
  // Any formatting character left is real Markdown, not text
  if (/[*_[\]`<>]|^\s*#|^\s*[-+]\s|^\s*\d+[.)]\s/m.test(unescaped)) {
    return undefined;
  }
  return markdown
    .replace(/ {2}\n/g, `\n`)
    .replace(/\\([\\`*_[\]<>#+\-.)])/g, `$1`);
}
