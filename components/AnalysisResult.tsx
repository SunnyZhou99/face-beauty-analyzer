'use client';

import { ScoreGauge } from './ScoreGauge';
import { getScoreComment, getFeatureAnalysis, getComparisonData } from '@/lib/utils';
import { useState, useEffect } from 'react';

type Gender = 'male' | 'female';

interface AnalysisResultProps {
  score: number;
  features: {
    eyes: number;
    nose: number;
    mouth: number;
    skin: number;
    symmetry: number;
  };
  gender: Gender;
  expression?: { expression: string; emoji: string; confidence: number };
  age?: { age: number; range: string };
  style?: { style: string; description: string; hairstyles: string[]; clothing: string[]; colors: string[]; vibe: string };
  fortune?: { title: string; emoji: string; description: string; luckyColor: string; luckyNumber: number };
  onClose: () => void;
}

export function AnalysisResult({ 
  score, 
  features, 
  gender, 
  expression,
  age,
  style,
  fortune,
  onClose 
}: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'style' | 'comparison' | 'share'>('analysis');
  const [showMore, setShowMore] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const comment = getScoreComment(score, gender);
  const comparison = getComparisonData(score);

  const featuresList = [
    { key: 'eyes', name: '眼睛', score: features.eyes },
    { key: 'nose', name: '鼻子', score: features.nose },
    { key: 'mouth', name: '嘴唇', score: features.mouth },
    { key: 'skin', name: '皮肤', score: features.skin },
    { key: 'symmetry', name: '对称性', score: features.symmetry }
  ];

  useEffect(() => {
    // 初始化
    setIsDark(document.documentElement.classList.contains('dark'));

    // 监听自定义事件来同步主题变化
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    window.addEventListener('theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {/* 头部 */}
        <div className={`bg-gradient-to-r ${comment.color} px-6 py-6 text-center sticky top-0 z-10`}>
          <span className="text-6xl block mb-2">{comment.emoji}</span>
          <h2 className="text-3xl font-bold text-white">{comment.title}</h2>
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl mt-4">
            <p className="text-sm">你的颜值得分是</p>
            <p className="text-6xl font-bold">{score}</p>
          </div>
          
          {/* 表情和年龄 */}
          <div className="flex justify-center gap-8 mt-4">
            {expression && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-2xl mr-2">{expression.emoji}</span>
                <span className="text-white font-semibold">{expression.expression}</span>
              </div>
            )}
            {age && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-white font-semibold">预测年龄: {age.range}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* 评价文字 */}
          <div className={`rounded-2xl p-6 mb-6 ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-lg leading-relaxed text-center ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {comment.description}
            </p>
            {fortune && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🍀</span>
                  <div>
                    <h4 className="font-bold text-orange-600">{fortune.title}</h4>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{fortune.description}</p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      幸运色: {fortune.luckyColor} | 幸运数字: {fortune.luckyNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab 切换 */}
          <div className={`flex gap-2 mb-6 p-1 rounded-xl ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'analysis'
                  ? `${isDark ? 'bg-gray-600 text-white' : 'bg-white text-purple-600'} shadow`
                  : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              🎨 五官分析
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'style'
                  ? `${isDark ? 'bg-gray-600 text-white' : 'bg-white text-purple-600'} shadow`
                  : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              👗 风格推荐
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'comparison'
                  ? `${isDark ? 'bg-gray-600 text-white' : 'bg-white text-purple-600'} shadow`
                  : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              📊 数据对比
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'share'
                  ? `${isDark ? 'bg-gray-600 text-white' : 'bg-white text-purple-600'} shadow`
                  : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              🔗 分享报告
            </button>
          </div>

          {/* 分析内容 */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {featuresList.slice(0, showMore ? 5 : 2).map(feature => {
                const analysis = getFeatureAnalysis(feature.key, feature.score, gender);
                return (
                  <div key={feature.key} className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} border-2 rounded-2xl p-6 hover:border-purple-200 transition-all`}>
                    <div className="flex items-start gap-4">
                      {/* 分数仪表盘 */}
                      <div className="flex-shrink-0">
                        <ScoreGauge 
                          score={feature.score} 
                          label={feature.name} 
                          color="blue-500" 
                        />
                      </div>
                      
                      {/* 详细分析 */}
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}>{analysis.level}</h4>
                        <p className={`mb-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>{analysis.description}</p>
                        <div className={`rounded-xl p-4 ${
                          isDark ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-50 to-pink-50'
                        }`}>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className="font-semibold">💡 建议：</span>
                          </p>
                          <ul className="space-y-1 text-sm mt-2">
                            {analysis.advice.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-500 flex-shrink-0">•</span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {featuresList.length > 2 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="w-full py-3 rounded-xl font-semibold transition-all bg-purple-100 text-purple-600 hover:bg-purple-200"
                >
                  {showMore ? '收起分析' : `查看全部 ${featuresList.length} 项分析 ↓`}
                </button>
              )}
            </div>
          )}

          {/* 风格推荐 */}
          {activeTab === 'style' && style && (
            <div className="space-y-6">
              {/* 风格标题 */}
              <div className={`rounded-2xl p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-center`}>
                <h3 className="text-2xl font-bold text-white mb-2">{style.style}</h3>
                <p className="text-white/90">{style.description}</p>
              </div>

              {/* 氛围感 */}
              <div className={`rounded-2xl p-6 ${
                isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  <span>✨</span> 你的氛围感
                </h4>
                <p className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>{style.vibe}</p>
              </div>

              {/* 推荐发型 */}
              {style.hairstyles && (
                <div className={`rounded-2xl p-6 ${
                  isDark ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <span>💇‍♀️</span> 推荐发型
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {style.hairstyles.map((hair, idx) => (
                      <span key={idx} className={`px-4 py-3 rounded-xl font-semibold ${
                        isDark ? 'bg-gray-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {hair}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 推荐穿搭 */}
              {style.clothing && (
                <div className={`rounded-2xl p-6 ${
                  isDark ? 'bg-gray-700' : 'bg-pink-50'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <span>👔</span> 推荐穿搭
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {style.clothing.map((item, idx) => (
                      <div key={idx} className={`rounded-xl p-4 text-center ${
                        isDark ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <span className={`font-semibold ${
                          isDark ? 'text-white' : 'text-pink-600'
                        }`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 推荐色系 */}
              {style.colors && (
                <div className={`rounded-2xl p-6 ${
                  isDark ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <span>🎨</span> 推荐色系
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {style.colors.map((color, idx) => (
                      <span key={idx} className={`px-4 py-2 rounded-full font-semibold ${
                        isDark ? 'bg-gray-600 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 对比内容 */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 text-center ${
                isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>📊 全国排名</h3>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    {comparison.rank}
                  </span>
                </div>
                <p className={`mt-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  你的颜值击败了全国 {comparison.beatCount} 的同龄人
                </p>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  （数据纯属虚构，仅供娱乐 😄）
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl p-6 text-center ${
                  isDark ? 'bg-gray-700' : 'bg-pink-50'
                }`}>
                  <span className="text-4xl">💖</span>
                  <h4 className={`font-bold mt-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>受欢迎程度</h4>
                  <p className="text-3xl font-bold text-pink-500 mt-2">
                    {score >= 90 ? '98%' : score >= 80 ? '85%' : score >= 70 ? '72%' : '65%'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>预计受欢迎程度</p>
                </div>
                <div className={`rounded-2xl p-6 text-center ${
                  isDark ? 'bg-gray-700' : 'bg-yellow-50'
                }`}>
                  <span className="text-4xl">⭐</span>
                  <h4 className={`font-bold mt-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>魅力值</h4>
                  <p className="text-3xl font-bold text-yellow-500 mt-2">
                    {score >= 90 ? 'S' : score >= 80 ? 'A+' : score >= 70 ? 'A' : 'B+'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>综合魅力评级</p>
                </div>
              </div>

              <div className={`rounded-2xl p-6 ${
                isDark ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <h4 className={`font-bold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>🎯 你的优势</h4>
                <ul className={`space-y-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {featuresList
                    .filter(f => f.score >= 85)
                    .map(f => (
                      <li key={f.key} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{f.name}得分 {f.score}，非常出色！</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* 分享内容 */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 ${
                isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <h3 className={`text-xl font-bold mb-4 text-center ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>📸 生成专属海报</h3>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-white'} rounded-xl p-6 border-2 border-dashed border-purple-200 text-center`}>
                  <span className="text-6xl block mb-4">🎨</span>
                  <p className={`mb-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    一键生成你的颜值分析海报<br/>
                    包含分数、评价和五官分析
                  </p>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all">
                    生成海报（消耗1次）
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all flex flex-col items-center gap-1">
                  <span className="text-2xl">💬</span>
                  <span className="text-sm">微信</span>
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all flex flex-col items-center gap-1">
                  <span className="text-2xl">📱</span>
                  <span className="text-sm">微博</span>
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all flex flex-col items-center gap-1">
                  <span className="text-2xl">🔗</span>
                  <span className="text-sm">复制链接</span>
                </button>
              </div>

              <div className={`rounded-2xl p-6 ${
                isDark ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>💡 分享文案</h4>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  "我的颜值得分是 {score} 分！想知道你有多少分吗？快来测测看！🎭✨"
                </p>
                <button className="mt-3 text-purple-600 font-semibold text-sm hover:underline">
                  点击复制文案
                </button>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3 mt-6">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              🔄 再测一张
            </button>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
