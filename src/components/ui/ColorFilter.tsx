'use client';
import { HiCheck } from 'react-icons/hi';

const PRESET_COLORS = [
  { hex: '#000000', label: 'Black' },
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#1E3A5F', label: 'Navy' },
  { hex: '#8B4513', label: 'Brown' },
  { hex: '#E74C3C', label: 'Red' },
  { hex: '#2ECC71', label: 'Green' },
  { hex: '#3498DB', label: 'Blue' },
  { hex: '#7F8C8D', label: 'Gray' },
  { hex: '#C9A84C', label: 'Gold' },
];

interface Props {
  selected: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorFilter({ selected, onChange }: Props) {
  const toggle = (hex: string) => {
    if (selected.includes(hex)) {
      onChange(selected.filter((c) => c !== hex));
    } else {
      onChange([...selected, hex]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {PRESET_COLORS.map((c) => {
        const isSelected = selected.includes(c.hex);
        return (
          <button
            key={c.hex}
            onClick={() => toggle(c.hex)}
            title={c.label}
            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
              isSelected
                ? 'border-gold ring-2 ring-gold/30 scale-110'
                : 'border-gray-600 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c.hex }}
          >
            {isSelected && (
              <HiCheck
                className={`w-4 h-4 ${
                  c.hex === '#FFFFFF' || c.hex === '#C9A84C' ? 'text-gray-900' : 'text-white'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
