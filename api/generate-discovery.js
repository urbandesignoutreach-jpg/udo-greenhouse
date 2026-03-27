module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { name, age, interests } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are the IP Kids Discovery Engine, created by Urban Design Outreach. Your energy is the X-Men Academy — every kid who walks in already has a superpower, and your job is to NAME IT and show them what it unlocks. Be bold, specific, celebratory, and age-appropriate. Speak directly to the child with warmth and fire.

SUPERPOWER: Generate a short, iconic 2-5 word superpower name (like "The World Builder" or "Sonic Storyteller" or "Code Whisperer"). One perfect emoji. A 2-sentence description written directly to the child — an origin story. Make it feel earned, real, and exciting.

INSPIRATIONS: Exactly 3 real, well-known people. Must be genuinely globally diverse — different genders, ethnicities, nationalities drawn from Europe, Asia, Latin America, Africa, the Middle East, Oceania, Indigenous communities worldwide. Mix historical and contemporary. Each must authentically connect to THIS child's specific combination of interests.

Respond with ONLY valid JSON. No markdown, no backticks, no preamble.

{"superpower":{"name":"2-5 word iconic superpower name","emoji":"one perfect emoji","description":"2-sentence origin story to the child. Bold and specific."},"celebration":"2-3 sentences celebrating this child's specific combination. Use their name. Make it feel rare and powerful.","rightNow":["5-7 specific fun things THIS WEEK. Creative, actionable, free or low-cost."],"twoYears":{"title":"In the Next 2 Years","items":["4-5 specific clubs, skills, or experiences"]},"fiveYears":{"title":"In 5 Years","items":["4-5 specific programs, competitions, or milestones"]},"youngAdult":{"title":"As a Young Adult","items":["4-5 real exciting career paths or entrepreneurial directions"]},"inspirations":[{"name":"Full Name","role":"Their field and what they are known for","why":"One sentence tying them specifically to this child's interests"}]}`,
        messages: [{
          role: 'user',
          content: `Child's name: ${name}\nAge: ${age}\nInterests: ${interests}\n\nGenerate their IP Kids discovery. Inspirations must be genuinely globally diverse.`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
if (!result.celebration) {
      console.error('Missing fields in result:', JSON.stringify(result).slice(0,200));
      return res.status(500).json({ error: 'Incomplete response from AI' });
    }
    return res.status(200).json(result);

  } catch (err) {
    console.error('Discovery error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
