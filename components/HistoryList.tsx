'use client';

import { useState } from 'react';

interface HistoryItem {
  id: string;
  image: string;
  score: number;
  gender: 'male' | 'female';
  date: string;
}

interface HistoryListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryList({ isOpen, onClose }: HistoryListProps) {
  const [histories, setHistories] = useState<HistoryItem[]>([
    {
      id: '1',
      image: 'https://via.placeholder.com/150',
      score: 92,
      gender: 'female',
      date: '2026-02-17'
    }
  ]);

  const handleClear = () => {
    if (confirm('确定清空历史记录吗？')) {
      setHistories([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">📜 分析历史</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {histories.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl block mb-4">📭</span>
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {histories.map((history) => (
                <div key={history.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all">
                  <img
                    src={history.image}
                    alt="历史照片"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${history.score >= 90 ? 'text-yellow-500' : history.score >= 80 ? 'text-pink-500' : 'text-blue-500'}`}>
                      {history.score}
                    </span>
                    <span className="text-xs text-gray-500">{history.date}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {history.gender === 'male' ? '👨 男生' : '👩 女生'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <button
            onClick={handleClear}
            className="px-6 py-2 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            🗑️ 清空记录
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
