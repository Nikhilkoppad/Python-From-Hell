import React, { useState } from 'react';
import { AudioEngine, type AudioSettings } from '../audio/AudioEngine';
import { Volume2, VolumeX, Mic, MicOff, Check, X } from 'lucide-react';

interface AudioSettingsModalProps {
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => AudioEngine.getSettings());

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    AudioEngine.updateSettings({ soundEnabled: updated.soundEnabled });
    if (updated.soundEnabled) AudioEngine.playSuccessChime();
  };

  const handleToggleVoice = () => {
    const updated = { ...settings, voiceEnabled: !settings.voiceEnabled };
    setSettings(updated);
    AudioEngine.updateSettings({ voiceEnabled: updated.voiceEnabled });
    if (updated.voiceEnabled) {
      AudioEngine.speak(settings.language === 'HINDI' ? 'Voice reactions on ho gaye.' : 'Voice reactions enabled.');
    }
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, volume: vol };
    setSettings(updated);
    AudioEngine.updateSettings({ volume: vol });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="max-w-md w-full bg-slate-950 border-2 border-red-600/70 rounded-2xl shadow-[0_0_80px_rgba(220,38,38,0.4)] p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-white font-black text-sm tracking-wider">
            <Volume2 className="w-5 h-5 text-red-500" />
            <span>AUDIO & MULTIMODAL CONTROLS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SETTINGS CONTROLS */}
        <div className="space-y-4 text-xs font-mono">
          
          {/* SOUND FX TOGGLE */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              <div>
                <div className="text-slate-200 font-bold">Synthesizer Sound Effects</div>
                <div className="text-[10px] text-slate-400">Terminal chimes, buzzers, and battle fanfares</div>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                settings.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* VOICE CALLOUTS TOGGLE */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.voiceEnabled ? <Mic className="w-5 h-5 text-red-400" /> : <MicOff className="w-5 h-5 text-slate-500" />}
              <div>
                <div className="text-slate-200 font-bold">AI Voice Callouts</div>
                <div className="text-[10px] text-slate-400">Spoken roasts, boss warnings, and briefings</div>
              </div>
            </div>
            <button
              onClick={handleToggleVoice}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                settings.voiceEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.voiceEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* VOLUME SLIDER */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-300 font-bold">
              <span>Master Volume</span>
              <span className="text-red-400">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

        </div>

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>SAVE & RETURN</span>
        </button>

      </div>
    </div>
  );
};
