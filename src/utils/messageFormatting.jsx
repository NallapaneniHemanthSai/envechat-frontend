const CODE_BLOCK_RE = /```([\s\S]*?)```/g
const INLINE_CODE_RE = /`([^`]+)`/g

function renderInline(text, keyPrefix) {
  const nodes = []
  let lastIndex = 0
  let match

  INLINE_CODE_RE.lastIndex = 0

  while ((match = INLINE_CODE_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    nodes.push(
      <code
        key={`${keyPrefix}-code-${match.index}`}
        className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[0.92em] text-blue-100"
      >
        {match[1]}
      </code>,
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export function renderMessageContent(content) {
  if (!content) return null

  const blocks = []
  let lastIndex = 0
  let match

  CODE_BLOCK_RE.lastIndex = 0

  while ((match = CODE_BLOCK_RE.exec(content))) {
    if (match.index > lastIndex) {
      blocks.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words">
          {renderInline(content.slice(lastIndex, match.index), `text-${lastIndex}`)}
        </p>,
      )
    }

    blocks.push(
      <pre
        key={`block-${match.index}`}
        className="custom-scroll my-2 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-[#050c14] p-3 font-mono text-[13px] leading-relaxed text-slate-200"
      >
        <code>{match[1].trim()}</code>
      </pre>,
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    blocks.push(
      <p key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words">
        {renderInline(content.slice(lastIndex), `text-${lastIndex}`)}
      </p>,
    )
  }

  return blocks
}
