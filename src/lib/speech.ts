/* Harvest Trend · รู้ทันราคา — SpeechSynthesis helper (v2 feature) */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakThai(text: string): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = 0.95;
  /* prefer a Thai voice when the device has one */
  const voices = synth.getVoices();
  const thVoice = voices.find(v => v.lang.toLowerCase().startsWith('th'));
  if (thVoice) u.voice = thVoice;
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}