export default function TestTabletPage() {
  const name = '王明'
  const imageUrl = `/api/og/tablet?type=longevity&name=${encodeURIComponent(name)}`

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          长生禄位测试 - 王明（2字）
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src={imageUrl}
              alt={name}
              style={{ 
                width: '320px', 
                height: '848px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#0070f3',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              在新窗口打开查看 →
            </a>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          backgroundColor: '#e3f2fd', 
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>检查要点：</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>✓ 文字是否垂直排列？</li>
            <li>✓ 文字是否居中对齐？</li>
            <li>✓ 文字是否在活动区域内？</li>
            <li>✓ 字体大小是否合适？</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          <p>直接访问 API: <code>{imageUrl}</code></p>
        </div>
      </div>
    </div>
  )
}

