import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const measurements = [
    { size: 'XS', chestIn: '36-38', chestCm: '91-96', lengthIn: '27.5', lengthCm: '70', waistIn: '28-30', waistCm: '71-76' },
    { size: 'S', chestIn: '38-40', chestCm: '96-101', lengthIn: '28.5', lengthCm: '72', waistIn: '30-32', waistCm: '76-81' },
    { size: 'M', chestIn: '40-42', chestCm: '101-106', lengthIn: '29.5', lengthCm: '75', waistIn: '32-34', waistCm: '81-86' },
    { size: 'L', chestIn: '42-44', chestCm: '106-111', lengthIn: '30.5', lengthCm: '77', waistIn: '34-36', waistCm: '86-91' },
    { size: 'XL', chestIn: '44-46', chestCm: '111-116', lengthIn: '31.5', lengthCm: '80', waistIn: '36-38', waistCm: '91-96' },
    { size: 'XXL', chestIn: '46-48', chestCm: '116-121', lengthIn: '32.5', lengthCm: '82', waistIn: '38-40', waistCm: '96-101' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 text-white p-6 shadow-2xl z-10 font-sans"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-black tracking-widest uppercase">PRAX SIZE GUIDE // {category.toUpperCase()}</h2>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">ALL PRAX TOPS FEATURE AN INTENTIONAL OVERSIZED FIT.</span>
              <div className="flex border border-zinc-800 bg-zinc-900">
                <button
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 font-bold ${unit === 'in' ? 'bg-white text-black' : 'text-zinc-400'}`}
                >
                  INCHES
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 font-bold ${unit === 'cm' ? 'bg-white text-black' : 'text-zinc-400'}`}
                >
                  CM
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">SIZE</th>
                    <th className="py-2.5 px-3">CHEST</th>
                    <th className="py-2.5 px-3">BODY LENGTH</th>
                    <th className="py-2.5 px-3">WAIST</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map(m => (
                    <tr key={m.size} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                      <td className="py-2.5 px-3 font-bold text-white">{m.size}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{unit === 'in' ? m.chestIn : m.chestCm}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{unit === 'in' ? m.lengthIn : m.lengthCm}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{unit === 'in' ? m.waistIn : m.waistCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              <strong>Fit Advice:</strong> If you prefer a tailored fit, we recommend sizing down one size. For the intended runway drape, select your standard size.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
