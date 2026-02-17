'use client';

interface FilterSelectorProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function FilterSelector({ currentFilter, onSelectFilter }: FilterSelectorProps) {
  const filters = [
    { name: '原图', filter: 'none', icon: '📷' },
    { name: '美白', filter: 'brightness(1.2) contrast(1.1)', icon: '✨' },
    { name: '柔光', filter: 'brightness(1.1) saturate(1.2)', icon: '💫' },
    { name: '复古', filter: 'sepia(0.3) contrast(1.1)', icon: '🎨' },
    { name: '冷调', filter: 'hue-rotate(10deg) saturate(1.1)', icon: '❄️' },
    { name: '暖调', filter: 'hue-rotate(-10deg) saturate(1.2)', icon: '🌅' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.filter}
          onClick={() => onSelectFilter(filter.filter)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            currentFilter === filter.filter
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="mr-1">{filter.icon}</span>
          {filter.name}
        </button>
      ))}
    </div>
  );
}
