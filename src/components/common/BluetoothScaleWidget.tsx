import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bluetooth, Scale, BatteryMedium, Wifi, Lock, Unlock, RotateCcw, Plus, Minus, X } from 'lucide-react';

export const BluetoothScaleWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    scaleState,
    connectScale,
    disconnectScale,
    tareScale,
    setManualScaleWeight,
    lockScaleReading,
    simulateWeightChange,
    scrapItems,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${scaleState.isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                Bluetooth Smart Scale
                {scaleState.isConnected && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Synced
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {scaleState.isConnected ? scaleState.deviceName : 'Disconnected'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Status Bar */}
        <div className="flex items-center justify-between my-4 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Bluetooth className={`w-3.5 h-3.5 ${scaleState.isConnected ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="font-mono">{scaleState.isConnected ? 'BLE-0x4F' : 'Offline'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">{scaleState.signalStrength} dBm</span>
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-emerald-400">
            <BatteryMedium className="w-4 h-4" />
            <span>{scaleState.batteryLevel}%</span>
          </div>
        </div>

        {/* Realistic Digital Scale LCD Display */}
        <div className="relative my-4 p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/30 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-emerald-500/70 font-mono tracking-wider mb-1">
            <span>CERTIFIED WEIGHING TERMINAL</span>
            <span className="flex items-center gap-1">
              {scaleState.isTare && <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded">TARE</span>}
              {scaleState.isLocked && <span className="bg-amber-500/20 text-amber-300 px-1 rounded">HOLD</span>}
              <span>STABLE</span>
            </span>
          </div>

          {/* Big LCD Numbers */}
          <div className="text-center py-4">
            <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              {scaleState.currentWeight.toFixed(2)}
              <span className="text-xl sm:text-2xl text-emerald-500/80 font-normal ml-2">kg</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Net Weight • Zero Tamper Encrypted Hash: <span className="text-slate-500">0x7F2A...</span>
            </p>
          </div>

          {/* Quick presets / Fine tuning */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => simulateWeightChange(-1)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 font-mono transition-colors"
            >
              <Minus className="w-3 h-3" /> 1kg
            </button>
            <button
              onClick={() => simulateWeightChange(-0.1)}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono transition-colors"
            >
              -0.1
            </button>
            <button
              onClick={() => simulateWeightChange(0.1)}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono transition-colors"
            >
              +0.1
            </button>
            <button
              onClick={() => simulateWeightChange(1)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 font-mono transition-colors"
            >
              <Plus className="w-3 h-3" /> 1kg
            </button>
            <button
              onClick={() => simulateWeightChange(5)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 font-mono transition-colors"
            >
              <Plus className="w-3 h-3" /> 5kg
            </button>
          </div>
        </div>

        {/* Scale Controls: Tare, Hold/Lock, Connect/Disconnect */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <button
            onClick={tareScale}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>TARE (Zero)</span>
          </button>

          <button
            onClick={lockScaleReading}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-medium text-xs transition-all active:scale-95 ${
              scaleState.isLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {scaleState.isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-slate-400" />}
            <span>{scaleState.isLocked ? 'LOCKED' : 'HOLD / LOCK'}</span>
          </button>

          <button
            onClick={scaleState.isConnected ? disconnectScale : connectScale}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-medium text-xs transition-all active:scale-95 ${
              scaleState.isConnected
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>{scaleState.isConnected ? 'DISCONNECT' : 'RECONNECT'}</span>
          </button>
        </div>

        {/* Quick simulation presets for testing */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Simulate Common Scrap Batches:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Raddi Bundle', weight: 18.5 },
              { label: 'PET Bottles Sack', weight: 6.2 },
              { label: 'Copper Coil', weight: 12.0 },
              { label: 'Iron Angle scrap', weight: 35.8 },
              { label: 'Inverter Battery', weight: 28.4 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setManualScaleWeight(preset.weight)}
                className="px-2.5 py-1 text-xs bg-slate-950 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-300 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition-colors"
              >
                {preset.label} ({preset.weight}kg)
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all"
        >
          Use Weighed Reading
        </button>
      </div>
    </div>
  );
};
