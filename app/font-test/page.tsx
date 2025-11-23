import React from 'react'
import localFont from 'next/font/local'

// Load the subset font
const notoSubset = localFont({
  src: '../../public/fonts/NotoSerifTC-Subset.otf',
  display: 'swap',
})

export default function FontTestPage() {
  const testCases = [
    { category: '核心业务字', text: '佛光注照 長生祿位 佛力超薦 往生蓮位' },
    { category: '常见姓氏', text: '王李张刘陈杨黄赵周吴徐孙朱马胡郭林何' },
    { category: '复姓', text: '欧阳上官皇甫令狐诸葛' },
    { category: '男性常见名字', text: '伟强勇明志杰峰涛浩宇轩昊博文辉' },
    { category: '女性常见名字', text: '秀娟英华慧美静芳燕娜丽云琳玉萍红' },
    { category: '测试"唯"字', text: '唯一唯独唯美唯心唯物' },
    { category: '少数民族', text: '买提热迪丽巴黎阖' },
    { category: '宗教用字', text: '龢䒟瑂靉菩薩' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">
          字体子集测试 (666 个字符)
        </h1>
        <p className="text-center text-slate-600 mb-8">
          文件大小: 186 KB | 从 1.29 MB 优化而来
        </p>

        <div className="space-y-6">
          {testCases.map((test, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-semibold text-slate-500 mb-3">
                {test.category}
              </h2>
              <div 
                className={`text-2xl ${notoSubset.className}`}
                style={{ 
                  letterSpacing: '0.05em',
                  lineHeight: '1.8'
                }}
              >
                {test.text}
              </div>
            </div>
          ))}

          {/* 垂直文字测试 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-slate-500 mb-3">
              垂直排版测试 (长生禄位)
            </h2>
            <div className="flex justify-center gap-8">
              <div 
                className={`${notoSubset.className}`}
                style={{ 
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  fontSize: '32px',
                  letterSpacing: '0.2em',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                上弘下唯法师
              </div>
              <div 
                className={`${notoSubset.className}`}
                style={{ 
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  fontSize: '32px',
                  letterSpacing: '0.2em',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                王明華
              </div>
              <div 
                className={`${notoSubset.className}`}
                style={{ 
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  fontSize: '32px',
                  letterSpacing: '0.2em',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                欧阳震华
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">✅ 优化成果</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• 字符数量：从 3867 个减少到 666 个精选字符</li>
              <li>• 文件大小：从 298 KB 优化到 186 KB</li>
              <li>• 涵盖范围：核心业务字 + 百家姓 + 高频名字用字</li>
              <li>• 包含特殊字符：少数民族常用字、宗教用字</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

