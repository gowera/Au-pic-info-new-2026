import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { Play, Pause, Radio, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RADIO_URL } from '@/lib/news';
const RadioContext = createContext({ open: false, close: () => {}, playing: false, loading: false, error: '', volume: 0.8, toggle: () => {}, setVolume: (_n: number) => {} });
export function RadioProvider({ children }: { children: ReactNode }) {
 const audio = useRef<HTMLAudioElement>(null);
 const [playing, setPlaying] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [volume, updateVolume] = useState(0.8); const [open, setOpen] = useState(false);
 const toggle = async () => {
  const player = audio.current; if (!player) return;
  if (!player.paused) { player.pause(); setPlaying(false); setLoading(false); return; }
  setOpen(true); setLoading(true); setError('');
  try { if (!player.getAttribute('src')) player.src = RADIO_URL; player.volume = volume; await player.play(); setPlaying(true); }
  catch { setError('Le direct est momentanément indisponible. Réessayez.'); setPlaying(false); }
  finally { setLoading(false); }
 };
 const setVolume = (n: number) => { updateVolume(n); if (audio.current) audio.current.volume = n; };
 return <RadioContext.Provider value={{ open, close: () => { audio.current?.pause(); setOpen(false); }, playing, loading, error, volume, toggle, setVolume }}><audio ref={audio} preload="none" onError={() => { setError('Le direct est momentanément indisponible. Réessayez.'); setPlaying(false); setLoading(false); }} onPause={() => setPlaying(false)} />{children}<RadioBar /></RadioContext.Provider>;
}
export function RadioButton() {
 const { playing, loading, toggle } = useContext(RadioContext);
  return <Button variant="radio" onClick={toggle} disabled={loading} aria-pressed={playing}>{playing ? <Pause /> : <Play />}<span>{loading ? 'Connexion…' : playing ? 'Radio en écoute' : 'Écouter la radio'}</span><span className="live-dot" /></Button>;
}
export function RadioPanel() {
 const { playing, loading, error, toggle, volume, setVolume } = useContext(RadioContext);
 return <section className="radio-panel"><div className="radio-top"><Radio size={21} /><span className="live-label"><span className="live-dot" /> EN DIRECT</span></div><h3>Aupic Radio</h3><p>La voix de l’actualité</p><div className={`radio-wave ${playing ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} />)}</div><div className="radio-controls"><Button variant="radioPlay" size="icon" onClick={toggle} disabled={loading} aria-label={playing ? 'Mettre la radio en pause' : 'Écouter Aupic Radio'}>{playing ? <Pause /> : <Play />}</Button><div><strong>{loading ? 'Connexion au direct…' : playing ? 'Vous êtes en direct' : 'Écouter le direct'}</strong><span>Aupic Radio · En ligne</span></div></div><div className="volume-control"><Volume2 size={16} /><input aria-label="Volume de la radio" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></div>{error && <p role="alert" className="radio-error">{error}</p>}</section>;
}
function RadioBar() {
 const { open, close, playing, loading, error, toggle, volume, setVolume } = useContext(RadioContext);
 if (!open) return null;
 return <div className="radio-bar" role="region" aria-label="Lecteur Aupic Radio"><div className="site-container radio-bar-inner"><Button variant="radioPlay" size="icon" onClick={toggle} disabled={loading} aria-label={playing ? 'Mettre la radio en pause' : 'Reprendre la radio'}>{playing ? <Pause /> : <Play />}</Button><div className="radio-bar-info"><span className="live-label"><span className="live-dot" /> EN DIRECT</span><strong>{error || (loading ? 'Connexion au direct…' : 'Aupic Radio — La voix de l’actualité')}</strong></div><div className={`radio-wave radio-bar-wave ${playing ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div><label className="radio-bar-volume"><Volume2 size={16} /><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label><Button variant="ghost" size="icon" onClick={close} aria-label="Fermer le lecteur"><X /></Button></div></div>;
}
