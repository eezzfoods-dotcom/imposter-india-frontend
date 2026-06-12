// ── AI CUSTOM ROUND GENERATOR ─────────────────────────────
// Option C: Search DB first, fall back to AI generation

import { ALL_ROUNDS } from '../data/gameData';

// ── STEP 1: Search existing database ─────────────────────
export function searchDatabase(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase();
  const terms = q.split(/\s+/);

  return ALL_ROUNDS.filter(r => {
    const searchable = [
      r.n, r.d, r.hero, r.heroine, r.comedian,
      r.l, r.y, r.g, r.c
    ].filter(Boolean).join(' ').toLowerCase();

    // Match all terms (AND logic)
    return terms.every(term => searchable.includes(term));
  });
}

// ── STEP 2: AI generation via Claude API ──────────────────
export async function generateAIRounds(query, count = 5) {
  const prompt = `You are a database for an Indian movie party game called "Imposter India".

Generate exactly ${count} movie/category entries matching this topic: "${query}"

Rules:
- Only include real, well-known Indian movies (Tamil, Telugu, Hindi, Malayalam) or English movies
- Never make up movies that don't exist
- For each movie provide accurate cast information
- If topic has fewer than ${count} matching movies, return as many as you know for sure

Return ONLY a JSON array, no other text:
[
  {
    "c": "Movie",
    "l": "Tamil",
    "n": "Movie Name",
    "d": "Director Name",
    "y": "2019",
    "g": "One line description of what the movie is about",
    "hero": "Hero Name or None",
    "heroine": "Heroine Name or None",
    "comedian": "Comedian Name or None"
  }
]

Language values: Tamil, Telugu, Hindi, Malayalam, English
Topic: ${query}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '[]';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const rounds = JSON.parse(clean);
    return rounds.filter(r => r.n && r.d); // validate
  } catch (e) {
    console.error('AI round parse error:', e);
    return [];
  }
}

// ── STEP 3: Combined search (Option C) ───────────────────
export async function getCustomRounds(query, targetCount = 5) {
  // First search database
  const dbResults = searchDatabase(query);

  if (dbResults.length >= targetCount) {
    // Enough in DB — shuffle and return
    const shuffled = dbResults.sort(() => Math.random() - 0.5);
    return {
      rounds: shuffled.slice(0, targetCount),
      source: 'database',
      total: dbResults.length,
    };
  }

  // Not enough in DB — fill with AI
  const needed = targetCount - dbResults.length;
  const existingNames = dbResults.map(r => r.n);

  const aiRounds = await generateAIRounds(
    `${query} — do NOT include these already found: ${existingNames.join(', ')}`,
    needed
  );

  return {
    rounds: [...dbResults, ...aiRounds].slice(0, targetCount),
    source: dbResults.length > 0 ? 'mixed' : 'ai',
    dbCount: dbResults.length,
    aiCount: aiRounds.length,
    total: dbResults.length + aiRounds.length,
  };
}
