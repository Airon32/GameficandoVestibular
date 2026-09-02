export function normalizeEnglishAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "you're": 'you are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "we're": 'we are',
  "they're": 'they are',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "i've": 'i have',
  "i'd": 'i would',
  "can't": 'cannot',
  "won't": 'will not',
};

function expand(text: string): string {
  return text
    .split(' ')
    .map((token) => CONTRACTIONS[token] || token)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answersMatch(userAnswer: string, accepted: string[]): boolean {
  const user = expand(normalizeEnglishAnswer(userAnswer));
  if (!user) return false;
  return accepted.some((candidate) => {
    const expected = expand(normalizeEnglishAnswer(candidate));
    return expected === user || expected.replace(/^(a|an|the)\s+/, '') === user.replace(/^(a|an|the)\s+/, '');
  });
}

export function writingHeuristicScore(text: string, minWords = 8): { score: number; feedback: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { score: 0, feedback: 'Escreva pelo menos algumas frases para receber feedback.' };
  let score = 40;
  if (words.length >= minWords) score += 20;
  if (words.length >= minWords * 2) score += 10;
  if (/[.?!]/.test(text)) score += 10;
  if (/[A-Z]/.test(text)) score += 8;
  if (!/(kkk|hahaha|asdf)/i.test(text)) score += 6;
  score = Math.min(92, score);
  return {
    score,
    feedback: score >= 70
      ? 'Texto compreensível. Depois você pode pedir revisão da professora de IA, se estiver configurada.'
      : 'Tente usar frases completas, pontuação e pelo menos o mínimo de palavras pedido.',
  };
}
