export function Header({ isDark = false }: { isDark?: boolean }) {
  return (
    <header className="border-b bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <span className="text-5xl">✨</span>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                AI 颜值分析仪
              </h1>
              <p className="text-white/90 text-sm">
                拍张照，AI 帮你分析颜值！仅供娱乐 🎭
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
