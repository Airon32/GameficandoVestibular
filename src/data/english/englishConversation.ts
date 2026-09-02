export const ENGLISH_SCENARIOS = [
  { id: 'coffee', title: 'Coffee Shop', prompt: 'You are ordering a drink. The barista greets you.' },
  { id: 'airport', title: 'Airport', prompt: 'You need to find your gate and check your boarding pass.' },
  { id: 'hotel', title: 'Hotel', prompt: 'You are checking in after a long trip.' },
  { id: 'interview', title: 'Job Interview', prompt: 'A recruiter asks about your experience.' },
  { id: 'school', title: 'School', prompt: 'A classmate wants to study together.' },
  { id: 'shopping', title: 'Shopping', prompt: 'You need a different size in a store.' },
  { id: 'travel', title: 'Travel', prompt: 'Ask for directions in a new city.' },
  { id: 'tech', title: 'Technology', prompt: 'Explain a problem with your laptop.' },
  { id: 'meeting', title: 'Meeting Someone', prompt: 'You meet a new student at a course.' },
  { id: 'work', title: 'Work Meeting', prompt: 'Share a short update with your team.' },
] as const;

export function localTeacherReply(input: {
  cefr: string;
  lastMistake?: string;
  weakSkill?: string;
  action: string;
}): string {
  const level = input.cefr.toUpperCase();
  if (input.action === 'explain_mistake' && input.lastMistake) {
    return level.startsWith('A')
      ? `Vamos olhar o erro com calma. ${input.lastMistake} A forma correta costuma seguir uma regra curta. Leia em voz alta e tente de novo.`
      : `About that mistake: ${input.lastMistake} Notice the structure, then produce a new sentence with the same pattern.`;
  }
  if (input.action === 'grammar') {
    return 'Try this: I ____ English every day. (study / studies). Why? Habits use Simple Present. I/you/we/they study; he/she/it studies.';
  }
  if (input.action === 'vocab') {
    return 'Review: although = embora. Example: Although the exam is hard, you can improve. Next review tomorrow if you miss it.';
  }
  if (input.weakSkill === 'listening') {
    return 'Listening is your weakest skill right now. Play a short sentence twice, then choose the question word you heard: where, what, when, why.';
  }
  return `Estimated level ${level}. Practice one short activity now: 4 current items, 2 reviews, 2 weak-skill items. AI extras stay optional.`;
}

export function localConversationReply(scenario: string, userText: string, learningMode: boolean): string {
  const polite = userText.toLowerCase().includes('please') || userText.toLowerCase().includes('would like');
  const correction = learningMode && !polite
    ? ' (Learning note: try “I would like… please” to sound more natural.)'
    : '';
  const map: Record<string, string> = {
    coffee: `Sure! A medium coffee is $3. Would you like it to go?${correction}`,
    airport: `Gate B12 is on the left after security. Do you have your boarding pass?${correction}`,
    hotel: `Welcome. I have a room with breakfast. May I see your ID?${correction}`,
    interview: `Thanks for coming. Can you tell me about a challenge you solved recently?${correction}`,
    school: `Great. Shall we review linking words together after class?${correction}`,
    shopping: `I can check the stock. What size do you need?${correction}`,
    travel: `The museum is two blocks ahead, next to the park.${correction}`,
    tech: `Have you tried restarting it? I can help you step by step.${correction}`,
    meeting: `Nice to meet you! Which exam are you preparing for?${correction}`,
    work: `Thanks for the update. What is the next deadline?${correction}`,
  };
  return map[scenario] || `I understand. Can you say a little more?${correction}`;
}
