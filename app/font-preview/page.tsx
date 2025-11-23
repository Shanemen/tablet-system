import React from 'react'

export default function FontPreviewPage() {
  const testNames = [
    '王明',
    '李小花',
    '歐陽震華',
    '买买提江·热合曼',
    'Christopher Nolan'
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.1.0/style.css');
        
        .font-noto { font-family: 'Noto Serif TC', serif; }
        .font-wenkai { font-family: 'LXGW WenKai Lite', sans-serif; }
        
        .tablet-card {
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 0.2em;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 24px;
        }
      `}} />

      <h1 className="text-3xl font-bold mb-8 text-center">字体风格对比 (Font Style Comparison)</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12">
        
        {/* Left Column: Noto Serif TC */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center text-slate-600">
            当前方案: Noto Serif TC (思源宋体)
            <br/>
            <span className="text-sm font-normal">庄重、严谨、碑刻感</span>
          </h2>
          <div className="space-y-4">
            {testNames.map((name, i) => (
              <div key={i} className="flex items-center justify-center p-4 bg-white rounded shadow">
                <div className="w-32 h-64 border-2 border-red-100 flex items-center justify-center bg-red-50">
                  <div className="font-noto text-3xl writing-vertical-rl text-upright" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                    {name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: LXGW WenKai */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center text-slate-600">
            推荐方案: LXGW WenKai (霞鹜文楷)
            <br/>
            <span className="text-sm font-normal">温润、书卷气、手写感</span>
          </h2>
          <div className="space-y-4">
            {testNames.map((name, i) => (
              <div key={i} className="flex items-center justify-center p-4 bg-white rounded shadow">
                <div className="w-32 h-64 border-2 border-red-100 flex items-center justify-center bg-red-50">
                  <div className="font-wenkai text-3xl writing-vertical-rl text-upright" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                    {name}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg max-w-3xl mx-auto">
        <h3 className="text-lg font-bold mb-2">关于 LXGW WenKai 的优势：</h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>字库极全</strong>：几乎不会出现“缺字回退”的情况。</li>
            <li><strong>开源免费</strong>：完全合规，无版权风险。</li>
            <li><strong>屏幕优化</strong>：在电子屏幕上阅读舒适度高于传统宋体。</li>
        </ul>
      </div>
    </div>
  )
}

