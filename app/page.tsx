'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AnalysisResult } from '@/components/AnalysisResult';
import { HistoryList } from '@/components/HistoryList';
import { FilterSelector } from '@/components/FilterSelector';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  analyzeBeautyScore,
  detectFaces,
  detectExpression,
  predictAge,
  getStyleRecommendation,
  getDailyFortune,
  getRemainingCount,
  decreaseCount,
  validateRedeemCodeAPI,
  useRedeemCodeAPI,
  getUsedRedeemCodes
} from '@/lib/utils';

interface HistoryItem {
  id: string;
  image: string;
  score: number;
  gender: 'male' | 'female';
  date: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [result, setResult] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [filter, setFilter] = useState<string>('none');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dailyFortune, setDailyFortune] = useState<any>(null);
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usedCodes, setUsedCodes] = useState<Array<{ code: string; count: number; usedAt: string; description: string }>>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 检测暗黑模式
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

  // 加载历史记录和每日运势
  useEffect(() => {
    const saved = localStorage.getItem('beautyHistories');
    if (saved) {
      try {
        setHistories(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load histories:', e);
      }
    }

    // 设置每日运势
    setDailyFortune(getDailyFortune());

    // 加载剩余次数
    const count = getRemainingCount();
    setRemainingCount(count);

    // 开发环境：如果检测到旧的次数值（>=3），重置为0
    if (count >= 3) {
      console.log('检测到旧数据，重置次数为0');
      localStorage.setItem('analysisCount', '0');
      setRemainingCount(0);
    }

    // 加载已使用的兑换码
    setUsedCodes(getUsedRedeemCodes());
  }, []);

  // 保存历史记录
  const saveHistory = (score: number) => {
    if (!image) return;
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      image,
      score,
      gender,
      date: new Date().toISOString().split('T')[0]
    };
    
    const newHistories = [newItem, ...histories].slice(0, 10); // 最多保存10条
    setHistories(newHistories);
    localStorage.setItem('beautyHistories', JSON.stringify(newHistories));
  };

  // 打开摄像头
  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的浏览器不支持摄像头访问，请使用 Chrome 或 Firefox 浏览器！📱');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      alert('无法访问摄像头，请检查浏览器权限设置！📷');
      console.error('Camera error:', error);
    }
  };

  // 关闭摄像头
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // 拍照
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setImage(imageData);
        closeCamera();
      }
    }
  };

  // 上传照片
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 处理文件
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      alert('请上传图片文件！📸');
    }
  };

  // 开始分析
  const startAnalysis = async () => {
    if (!image) {
      alert('请先拍照或上传照片！📸');
      return;
    }

    if (remainingCount <= 0) {
      setShowRedeemModal(true);
      return;
    }

    setIsDetecting(true);
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // 步骤1：检测人脸
      setStatus('正在检测人脸...');
      setProgress(20);
      
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      const faceResult = await detectFaces(img);
      
      if (!faceResult.hasFace) {
        setIsAnalyzing(false);
        setIsDetecting(false);
        alert(faceResult.error || '未检测到人脸，请上传包含清晰正脸的照片！');
        return;
      }

      // 步骤2：分析五官
      setStatus('正在分析五官...');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤3：计算颜值
      setStatus('正在计算颜值...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      const beautyData = analyzeBeautyScore();
      
      // 步骤4：生成报告
      setStatus('正在生成报告...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 300));

      // 额外信息
      const expression = detectExpression();
      const age = predictAge();
      const style = getStyleRecommendation(beautyData.score, gender);
      const fortune = getDailyFortune();

      const fullResult = {
        ...beautyData,
        expression,
        age,
        style,
        fortune
      };

      setProgress(100);
      saveHistory(beautyData.score);
      decreaseCount();
      setRemainingCount(getRemainingCount());

      setTimeout(() => {
        setResult(fullResult);
        setIsAnalyzing(false);
        setIsDetecting(false);
        setProgress(0);
        setStatus('');
      }, 300);
      
    } catch (error) {
      setIsAnalyzing(false);
      setIsDetecting(false);
      setProgress(0);
      setStatus('');
      alert('分析失败，请重试！');
      console.error('Analysis error:', error);
    }
  };

  // 使用兑换码
  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemMessage({ type: 'error', text: '请输入兑换码！' });
      return;
    }

    setIsRedeeming(true);

    // 先验证兑换码
    const validation = await validateRedeemCodeAPI(redeemCode);

    if (!validation.valid) {
      setRedeemMessage({ type: 'error', text: validation.message });
      setIsRedeeming(false);
      return;
    }

    // 执行兑换
    const result = await useRedeemCodeAPI(redeemCode);

    if (result.success) {
      const current = getRemainingCount();
      const newCount = current + (result.count || 0);
      setRemainingCount(newCount);

      // 刷新已使用的兑换码列表
      setUsedCodes(getUsedRedeemCodes());

      setRedeemMessage({ type: 'success', text: `${result.message}！当前剩余 ${newCount} 次` });
      setRedeemCode('');

      // 3秒后清除消息
      setTimeout(() => setRedeemMessage(null), 3000);
    } else {
      setRedeemMessage({ type: 'error', text: result.message });
    }

    setIsRedeeming(false);
  };

  // 支付功能（模拟）
  const handlePayment = () => {
    alert('💳 支付功能开发中...\n\n暂时请使用兑换码增加次数！\n\n测试兑换码：BEAUTY2026、AI666');
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
    }`}>
      <ThemeToggle />
      <Header isDark={isDark} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 摄像头区域 */}
          {isCameraOpen ? (
            <div className={`rounded-3xl shadow-xl p-6 mb-8 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="relative rounded-2xl overflow-hidden bg-black mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-96 object-cover transform scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={takePhoto}
                    className="bg-white/90 hover:bg-white text-gray-800 font-bold px-8 py-3 rounded-full shadow-lg transition-all flex items-center gap-2"
                  >
                    📸 拍照
                  </button>
                  <button
                    onClick={closeCamera}
                    className="bg-red-500/90 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all"
                  >
                    ✕ 关闭
                  </button>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">
                💡 提示：确保照片中有清晰的正脸，否则无法分析！
              </p>
            </div>
          ) : (
            <>
              {/* 主操作区 */}
              {!image ? (
                <div 
                  className={`rounded-3xl shadow-xl p-8 mb-8 border-2 border-dashed transition-all ${
                    isDragOver 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300'
                  } ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <h2 className={`text-2xl font-bold mb-6 text-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    第一步：获取你的照片 📸
                  </h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <button
                      onClick={openCamera}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all flex flex-col items-center gap-3"
                    >
                      <span className="text-5xl">📷</span>
                      <span>开启摄像头拍照</span>
                      <span className="text-sm opacity-90">实时捕捉你的美</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all flex flex-col items-center gap-3"
                    >
                      <span className="text-5xl">📂</span>
                      <span>上传本地照片</span>
                      <span className="text-sm opacity-90">支持 JPG、PNG 或拖拽上传</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* 每日运势 */}
                  {dailyFortune && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{dailyFortune.emoji}</span>
                        <div>
                          <h3 className="font-bold text-white mb-2">{dailyFortune.title}</h3>
                          <p className="text-white/90 text-sm">
                            {dailyFortune.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`rounded-2xl p-6 ${
                    isDark 
                      ? 'bg-gray-700' 
                      : 'bg-gradient-to-r from-yellow-50 to-orange-50'
                  }`}>
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">💡</span>
                      <div>
                        <h3 className={`font-bold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}>使用建议</h3>
                        <ul className={`text-sm space-y-1 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <li>• 请上传包含清晰正脸的人像照片</li>
                          <li>• 正面光线充足的环境</li>
                          <li>• 保持自然表情，微笑效果最佳</li>
                          <li>• 非人像图片将无法进行分析 🚫</li>
                          <li>• 本工具仅供娱乐，请勿当真 😄</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 照片预览区 */
                <div className={`rounded-3xl shadow-xl p-6 mb-8 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {/* 滤镜选择 */}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold mb-3 text-center ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      选择滤镜 ✨
                    </h3>
                    <FilterSelector currentFilter={filter} onSelectFilter={setFilter} />
                  </div>

                  {/* 性别选择 */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-bold mb-3 text-center ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      请选择你的性别 👤
                    </h3>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setGender('male')}
                        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                          gender === 'male'
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-3xl block mb-1">👨</span>
                        男生
                      </button>
                      <button
                        onClick={() => setGender('female')}
                        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                          gender === 'female'
                            ? 'bg-pink-500 text-white shadow-lg scale-105'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-3xl block mb-1">👩</span>
                        女生
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden mb-6">
                    <img 
                      ref={imageRef}
                      src={image} 
                      alt="用户照片" 
                      className="w-full h-96 object-cover"
                      style={{ filter }}
                    />
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-all"
                      >
                        📜 历史
                      </button>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={openCamera}
                        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-all"
                      >
                        📷 重拍
                      </button>
                      <button
                        onClick={() => setImage(null)}
                        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-all"
                      >
                        ✕ 重新选择
                      </button>
                    </div>
                  </div>

                  {/* 进度条 */}
                  {isAnalyzing && (
                    <div className="mb-6">
                      <ProgressBar progress={progress} status={status} />
                    </div>
                  )}

                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing || isDetecting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none"
                  >
                    {isAnalyzing ? (
                      isDetecting ? (
                        <span className="flex items-center justify-center gap-3">
                          <span className="text-2xl animate-spin">🔍</span>
                          <span>正在检测人脸...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <span className="text-2xl animate-spin">🔮</span>
                          <span>正在分析你的颜值...</span>
                        </span>
                      )
                    ) : (
                      <span className="flex items-center justify-center gap-3 text-xl">
                        <span>✨</span>
                        <span>开始颜值分析</span>
                        <span>✨</span>
                      </span>
                    )}
                  </button>

                  {/* 剩余次数显示 */}
                  <div className={`rounded-2xl p-4 text-center ${
                    remainingCount <= 1 ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
                  }`}>
                    <p className={`text-lg ${remainingCount <= 1 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      🎟️ 剩余分析次数: <span className="font-bold">{remainingCount}</span>
                    </p>
                    <button
                      onClick={() => setShowRedeemModal(true)}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-semibold underline"
                    >
                      兑换码 / 获取更多次数 →
                    </button>
                  </div>
                </div>
              )}

              {/* 功能特点 */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: '👁️', title: '五官分析', desc: '眼睛鼻子嘴巴' },
                  { icon: '🧴', title: '皮肤检测', desc: '肤色状态评估' },
                  { icon: '⚖️', title: '对称性', desc: '面部对称度' },
                  { icon: '🎨', title: '美颜滤镜', desc: '多种滤镜选择' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{feature.icon}</span>
                    <h3 className={`font-bold mb-1 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{feature.title}</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 分析结果弹窗 */}
      {result && (
        <AnalysisResult
          score={result.score}
          features={result.features}
          gender={gender}
          expression={result.expression}
          age={result.age}
          style={result.style}
          fortune={result.fortune}
          onClose={() => {
            setResult(null);
            setImage(null);
          }}
        />
      )}

      {/* 历史记录弹窗 */}
      <HistoryList isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* 兑换码/支付弹窗 */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl max-w-md w-full p-8 shadow-2xl`}>
            <h2 className="text-2xl font-bold mb-6 text-center">
              <span className="mr-2">🎫</span>
              兑换码 / 购买次数
            </h2>

            <div className="mb-6">
              <div className={`rounded-xl p-4 text-center mb-6 ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <p className={`text-lg ${remainingCount <= 1 ? 'text-red-600' : 'text-purple-600'}`}>
                  当前剩余: <span className="font-bold text-3xl">{remainingCount}</span> 次
                </p>
              </div>

              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                输入兑换码
              </label>
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setRedeemCode(value.toUpperCase());
                }}
                placeholder="请输入兑换码"
                disabled={isRedeeming}
                className={`w-full px-4 py-3 rounded-xl border-2 mb-3 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:border-purple-500 outline-none transition-all disabled:opacity-50`}
              />
              <button
                onClick={handleRedeemCode}
                disabled={isRedeeming}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {isRedeeming ? '兑换中...' : '确认兑换'}
              </button>

              {redeemMessage && (
                <div className={`mt-3 p-3 rounded-lg text-center ${
                  redeemMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {redeemMessage.text}
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 pt-6">
              <h3 className={`font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                💳 购买分析次数
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { count: 1, price: '0.88', popular: false },
                  { count: 5, price: '3.88', popular: true },
                  { count: 10, price: '6.88', popular: false }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={handlePayment}
                    className={`relative rounded-xl p-4 border-2 transition-all ${
                      item.popular
                        ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                        : isDark
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        推荐
                      </span>
                    )}
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {item.count}次
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ¥{item.price}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 兑换码使用历史 */}
            {usedCodes.length > 0 && (
              <div className={`mt-6 rounded-xl p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  📜 兑换记录 ({usedCodes.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {usedCodes.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-xs p-2 rounded ${
                        isDark ? 'bg-gray-600' : 'bg-white'
                      }`}
                    >
                      <div>
                        <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          {item.code}
                        </span>
                        <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{item.count}次
                        </span>
                      </div>
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        {new Date(item.usedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                测试兑换码: BEAUTY2026 (5次) | AI666 (10次) | TEST888 (1次)
              </p>
              <button
                onClick={() => {
                  if (confirm('确定要清除所有数据吗？包括历史记录和兑换记录。')) {
                    localStorage.removeItem('analysisCount');
                    localStorage.removeItem('usedRedeemCodes');
                    localStorage.removeItem('beautyHistories');
                    setRemainingCount(0);
                    setHistories([]);
                    setUsedCodes([]);
                    setRedeemCode('');
                    setRedeemMessage({ type: 'success', text: '数据已清除！' });
                    setTimeout(() => setRedeemMessage(null), 2000);
                  }
                }}
                className={`text-xs ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
              >
                重置所有数据
              </button>
            </div>

            <button
              onClick={() => {
                setShowRedeemModal(false);
                setRedeemCode('');
                setRedeemMessage(null);
                // 关闭弹窗时刷新剩余次数
                setRemainingCount(getRemainingCount());
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className={`py-8 mt-16 ${
        isDark ? 'bg-gray-900' : 'bg-gray-900'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`}>
            🎭 仅供娱乐，颜值无法定义美！每个人都有独特魅力 ✨
          </p>
          <p className="text-xs mt-2 text-gray-500">
            © 2026 AI 颜值分析仪 | 本工具使用模拟分析，非真实 AI
          </p>
        </div>
      </footer>
    </div>
  );
}
