// Tag- und Nachtmodus (automatisch 20:00–07:00) und Schriften aus dem Designsystem.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { farbenNacht, farbenTag, type Farben } from '../theme/tokens';
import { useS } from '../store/store';

export const F = {
  ui: 'AtkinsonHyperlegibleNext_400Regular',
  uiHalb: 'AtkinsonHyperlegibleNext_600SemiBold',
  uiFett: 'AtkinsonHyperlegibleNext_700Bold',
  zahl: 'AtkinsonHyperlegibleMono_400Regular',
  zahlHalb: 'AtkinsonHyperlegibleMono_600SemiBold',
  rtl: 'NotoSansArabic_400Regular',
};

export type Thema = Farben & { nacht: boolean };
const Ctx = createContext<Thema>({ ...farbenTag, nacht: false });

export function istNacht(theme: string, jetzt = new Date()): boolean {
  const h = jetzt.getHours();
  return theme === 'nacht' || (theme === 'auto' && (h >= 20 || h < 7));
}

export function ThemaProvider({ children }: { children: ReactNode }) {
  const S = useS();
  const [minute, setMinute] = useState(0);
  useEffect(() => { const t = setInterval(() => setMinute((m) => m + 1), 60000); return () => clearInterval(t); }, []);
  const nacht = istNacht(S.theme);
  void minute;
  return <Ctx.Provider value={{ ...(nacht ? farbenNacht : farbenTag), nacht }}>{children}</Ctx.Provider>;
}

export function useFarben(): Thema { return useContext(Ctx); }
