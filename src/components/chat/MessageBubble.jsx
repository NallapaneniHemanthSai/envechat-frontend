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
        marginBottom: 16,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          ...avatarStyle,
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div style={{ maxWidth: 520 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 5,
            alignItems: 'center',
            flexDirection: own ? 'row-reverse' : 'row',
          }}
        >
          <span
            style={{
              color: '#cbd5e1',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {own ? 'you' : sender}
          </span>

          <span
            style={{
              color: '#64748b',
              fontSize: 11,
            }}
          >
            {timestamp}
          </span>
        </div>

        <div
          style={{
            background: own
              ? 'rgba(59,130,246,0.12)'
              : '#1e293b',

            border: own
              ? '1px solid rgba(59,130,246,0.2)'
              : '1px solid #334155',

            padding: '12px 16px',
            borderRadius: 18,
            color: '#f8fafc',
            fontSize: 14,
            lineHeight: 1.6,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </div>
      </div>
    </div>
  )
}