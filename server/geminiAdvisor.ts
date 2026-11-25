import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize Gemini AI client:', e);
    }
  }
  return aiClient;
}

export async function generateMlmAdvisory(query: string, userContext?: any): Promise<string> {
  const ai = getAiClient();

  if (!ai) {
    return getLocalMlmAdvice(query, userContext);
  }

  try {
    const prompt = `You are a Senior Direct Selling (MLM) Business Growth Strategist and Indian Legal Compliance Expert for "Watch Video Dream in Hand Pvt. Ltd.".
The user is asking: "${query}".

Context of user:
${JSON.stringify(userContext || {}, null, 2)}

Provide an actionable, inspiring, and direct answer adhering to:
1. Indian Direct Selling Guidelines (Consumer Protection Direct Selling Rules, 2021).
2. Practical network building scripts (how to invite, pitch video tasks, dual-leg balance, BV generation).
3. Motivation and next-rank milestone calculation tips.
Keep it structured, punchy, professional, and friendly with emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || getLocalMlmAdvice(query, userContext);
  } catch (err) {
    console.warn('Gemini API call failed, falling back to expert offline advice:', err);
    return getLocalMlmAdvice(query, userContext);
  }
}

function getLocalMlmAdvice(query: string, userContext?: any): string {
  const q = query.toLowerCase();

  if (q.includes('invite') || q.includes('pitch') || q.includes('script') || q.includes('how to join')) {
    return `### 🌟 High-Converting Direct Selling Invite Script (3-Step Formula)

**Step 1: The Curiosity Hook (Phone/WhatsApp)**
> *"Namaste [Name], I have partnered with India's fastest growing digital direct selling platform **Watch Video Dream in Hand**. You can earn daily rewards simply by watching verified product videos and building a 2-team network with zero inventory risk. Are you open to taking a 15-minute look?"*

**Step 2: Present the Core Opportunity**
- **Dual Income Streams**: Daily AdMob/Video Task credits (₹200+ daily) PLUS Dual-leg Binary Matching Income (10%).
- **18 Recognition Levels**: Win all-expenses-paid luxury trips from Domestic Goa tours to Dubai, Singapore, and Europe.
- **Accidental Death Safeguard Scheme**: Nominee security from Rank 7 (Topaz) upwards.

**Step 3: Clear Call to Action**
> *"Let me share my Sponsor Code (**${userContext?.id || 'WDH-100001'}**). Register your free account and watch your first 5 videos today!"*`;
  }

  if (q.includes('rank') || q.includes('upgrade') || q.includes('bv') || q.includes('next')) {
    return `### 🚀 Roadmap to Accelerate Your Next Rank Promotion

1. **Balance Dual Verticals (Group 1 & Group 2)**:
   - Always ensure your weaker leg meets the minimum BV threshold (e.g. Bronze needs 1,400 Weaker / 2,600 Stronger BV).
2. **Duplicate Video Task Discipline**:
   - Guide your direct 5 team members to complete their 10 daily video tasks. 5 members × 25 BV × 30 days = 3,750 BV monthly automatic turnover!
3. **Focus on Consumer Products & Video Ad Re-purchases**:
   - Products like *Panchamrit Juice* and *Shilajit Vitality* offer 500-1000 BV per unit with 35% retail margins.
4. **Track Recognition Badges in your Member Dashboard** to claim your Tour Rewards!`;
  }

  return `### 💡 Strategic Advice from Watch Video Dream in Hand ERP

- **Compliance First**: Under the Indian Direct Selling Rules 2021, focus on genuine product utility, verified BV turnover, and transparent digital KYC (PAN & Bank verification).
- **Binary Placement Tip**: Use the **"Auto Placement: Weaker Leg"** setting in the ERP to automatically direct spillover volume to your leg with lower BV, maximizing weekly matching payouts.
- **Nominee Protection**: Reach Rank 7 (Topaz) and above to activate the Accidental Death Safeguard Scheme for your family.`;
}
