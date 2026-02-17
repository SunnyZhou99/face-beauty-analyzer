'use client';

import { useState, useEffect } from 'react';

interface RedeemCode {
  id: string;
  code: string;
  count: number;
  description: string;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'disabled' | 'expired';
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    count: 1,
    description: '',
    maxUses: 1,
    expiresAt: ''
  });

  // 获取兑换码列表
  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/redeem');
      const data = await response.json();
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('获取兑换码失败:', error);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // 创建兑换码
  const handleCreateCode = async () => {
    if (!newCode.code || !newCode.count) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/redeem-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode)
      });

      const data = await response.json();
      if (data.success) {
        alert('创建成功！');
        setShowCreateModal(false);
        setNewCode({ code: '', count: 1, description: '', maxUses: 1, expiresAt: '' });
        fetchCodes();
      } else {
        alert(data.message || '创建失败');
      }
    } catch (error) {
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除兑换码
  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('确定要删除这个兑换码吗？')) return;

    try {
      const response = await fetch('/api/redeem', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId })
      });

      const data = await response.json();
      if (data.success) {
        alert('删除成功');
        fetchCodes();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  // 更新兑换码状态
  const handleUpdateStatus = async (codeId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/redeem-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, status })
      });

      const data = await response.json();
      if (data.success) {
        fetchCodes();
      }
    } catch (error) {
      alert('更新失败');
    }
  };

  // 生成随机兑换码
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'disabled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '有效';
      case 'disabled': return '已禁用';
      case 'expired': return '已过期';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎫 兑换码管理后台
          </h1>
          <p className="text-gray-600">
            实时监控和管理所有兑换码的使用情况
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">{codes.length}</div>
            <div className="text-gray-600 text-sm">总兑换码</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600">
              {codes.filter(c => c.status === 'active').length}
            </div>
            <div className="text-gray-600 text-sm">有效兑换码</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">
              {codes.reduce((sum, c) => sum + c.usedCount, 0)}
            </div>
            <div className="text-gray-600 text-sm">总使用次数</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-orange-600">
              {codes.filter(c => c.usedCount >= c.maxUses).length}
            </div>
            <div className="text-gray-600 text-sm">已用完</div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          >
            ➕ 创建新兑换码
          </button>
          <button
            onClick={fetchCodes}
            className="ml-4 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            🔄 刷新列表
          </button>
        </div>

        {/* 兑换码列表 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">兑换码列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">兑换码</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">次数</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">描述</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">使用情况</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-purple-600">{code.code}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{code.count}</td>
                    <td className="px-6 py-4 text-gray-600">{code.description}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className={code.usedCount >= code.maxUses ? 'text-red-600' : 'text-green-600'}>
                          {code.usedCount}/{code.maxUses}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${code.usedCount >= code.maxUses ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${(code.usedCount / code.maxUses) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(code.status)}`}>
                        {getStatusText(code.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(code.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {code.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(code.id, 'disabled')}
                            className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded text-sm transition-all"
                          >
                            禁用
                          </button>
                        )}
                        {code.status === 'disabled' && (
                          <button
                            onClick={() => handleUpdateStatus(code.id, 'active')}
                            className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded text-sm transition-all"
                          >
                            启用
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm transition-all"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {codes.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                暂无兑换码，点击上方按钮创建
              </div>
            )}
          </div>
        </div>

        {/* 创建兑换码弹窗 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold mb-6">创建兑换码</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">兑换码</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      placeholder="输入或生成"
                      className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
                    />
                    <button
                      onClick={generateRandomCode}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      生成
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">赠送次数</label>
                  <input
                    type="number"
                    value={newCode.count}
                    onChange={(e) => setNewCode({ ...newCode, count: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">描述</label>
                  <input
                    type="text"
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    placeholder="例如：活动赠送5次"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">最大使用次数</label>
                  <input
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">设置为1表示每个用户只能使用一次</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">过期时间（可选）</label>
                  <input
                    type="datetime-local"
                    value={newCode.expiresAt}
                    onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">留空表示永不过期</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateCode}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? '创建中...' : '创建'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
