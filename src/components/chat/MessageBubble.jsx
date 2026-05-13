export default function MessageBubble({
  own,
  sender,
  content,
  timestamp,
  initials,
  avatarStyle,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: own ? 'row-reverse' : 'row',
        gap: 10,
        marginBottom: 18,
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          ...avatarStyle,
          width: 38,
          height: 38,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {initials}
      </div>

      {/* Message Container */}
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: own ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 6,
            alignItems: 'center',
            flexDirection: own ? 'row-reverse' : 'row',
            width: '100%',
          }}
        >
          <span
            style={{
              color: '#cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 140,
            }}
          >
            {own ? 'You' : sender}
          </span>

          <span
            style={{
              color: '#64748b',
              fontSize: 11,
              flexShrink: 0,
            }}
          >
            {timestamp}
          </span>
        </div>

        {/* Bubble */}
        <div
          style={{
            background: own
              ? 'linear-gradient(135deg,#0ea5e9,#0284c7)'
              : '#1e293b',

            border: own
              ? '1px solid rgba(14,165,233,0.25)'
              : '1px solid #334155',

            padding: '12px 16px',
            borderRadius: 18,
            color: '#f8fafc',
            fontSize: 14,
            lineHeight: 1.6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            wordBreak: 'break-word',
            width: 'fit-content',
          }}
        >
          {content}
        </div>
      </div>
    </div>
  )
}