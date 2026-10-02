// Einstieg: Schriften laden, gespeicherte Daten lesen, Tag/Nacht, Diensttagwechsel um 12:00.
// Nur die benötigten Schnitte einbinden (Pfade je Schnitt halten die App klein).
import { AtkinsonHyperlegibleMono_400Regular } from '@expo-google-fonts/atkinson-hyperlegible-mono/400Regular';
import { AtkinsonHyperlegibleMono_600SemiBold } from '@expo-google-fonts/atkinson-hyperlegible-mono/600SemiBold';
import { AtkinsonHyperlegibleNext_400Regular } from '@expo-google-fonts/atkinson-hyperlegible-next/400Regular';
import { AtkinsonHyperlegibleNext_600SemiBold } from '@expo-google-fonts/atkinson-hyperlegible-next/600SemiBold';
import { AtkinsonHyperlegibleNext_700Bold } from '@expo-google-fonts/atkinson-hyperlegible-next/700Bold';
import { NotoSansArabic_400Regular } from '@expo-google-fonts/noto-sans-arabic/400Regular';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Geruest } from './src/bereiche/Geruest';
import { laden, tagesWechselBeobachten, useU } from './src/store/store';
import { ThemaProvider, useFarben } from './src/ui/theme';

function Inhalt() {
  const f = useFarben();
  const geladen = useU((u) => u.geladen);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: f.grund }} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={f.nacht ? 'light' : 'dark'} />
      {geladen ? <Geruest /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={f.tinte} /></View>}
    </SafeAreaView>
  );
}

export default function App() {
  const [schriften] = useFonts({ AtkinsonHyperlegibleNext_400Regular, AtkinsonHyperlegibleNext_600SemiBold, AtkinsonHyperlegibleNext_700Bold, AtkinsonHyperlegibleMono_400Regular, AtkinsonHyperlegibleMono_600SemiBold, NotoSansArabic_400Regular });
  useEffect(() => { laden(); return tagesWechselBeobachten(); }, []);
  if (!schriften) return null;
  return (
    <SafeAreaProvider>
      <ThemaProvider><Inhalt /></ThemaProvider>
    </SafeAreaProvider>
  );
}
