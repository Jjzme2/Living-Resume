/** Lightweight markdown → HTML renderer (no deps). */
export function useMarkdown() {
  function escHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function inline(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
  }

  function renderMarkdown(md: string): string {
    if (!md?.trim()) return ''
    let html = md

    // Fenced code blocks
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang || 'text'}">${escHtml(code.trimEnd())}</code></pre>`)

    const lines = html.split('\n')
    const out: string[] = []
    let inList = false
    let inOrderedList = false
    let inBlockquote = false

    for (const line of lines) {
      if (line.startsWith('<pre>') || line.includes('</code></pre>')) {
        if (inList) { out.push('</ul>'); inList = false }
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
        if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
        out.push(line); continue
      }

      if (/^#{1,6} /.test(line)) {
        if (inList) { out.push('</ul>'); inList = false }
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
        if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
        const level = line.match(/^#+/)![0].length
        out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`)
        continue
      }

      if (line.startsWith('> ')) {
        if (inList) { out.push('</ul>'); inList = false }
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
        if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true }
        out.push(`<p>${inline(line.slice(2))}</p>`); continue
      }
      if (inBlockquote && !line.startsWith('> ')) { out.push('</blockquote>'); inBlockquote = false }

      if (/^[-*+] /.test(line)) {
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
        if (!inList) { out.push('<ul>'); inList = true }
        out.push(`<li>${inline(line.slice(2))}</li>`); continue
      }

      if (/^\d+\. /.test(line)) {
        if (inList) { out.push('</ul>'); inList = false }
        if (!inOrderedList) { out.push('<ol>'); inOrderedList = true }
        out.push(`<li>${inline(line.replace(/^\d+\. /, ''))}</li>`); continue
      }

      if (line.trim() === '') {
        if (inList) { out.push('</ul>'); inList = false }
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
        if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
        out.push(''); continue
      }

      if (inList) { out.push('</ul>'); inList = false }
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }

      if (/^---+$/.test(line.trim())) { out.push('<hr />'); continue }

      out.push(`<p>${inline(line)}</p>`)
    }

    if (inList) out.push('</ul>')
    if (inOrderedList) out.push('</ol>')
    if (inBlockquote) out.push('</blockquote>')

    return out.join('\n')
  }

  return { renderMarkdown }
}
