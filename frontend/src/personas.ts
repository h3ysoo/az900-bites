export const PERSONA_LABELS: Record<string, string> = {
  klasik_hoca: '👨‍🏫 The Professor',
  analoji_ustasi: '💡 Analogy Master',
  kisa_kesen: '⚡ Short & Sweet',
};

// Fallback when the /personas request fails.
export const PERSONAS = Object.keys(PERSONA_LABELS);

// Personas unknown to the label map (e.g. a freshly added prompt file)
// still get a readable chip label derived from their key.
export function personaLabel(key: string): string {
  return (
    PERSONA_LABELS[key] ??
    key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}
