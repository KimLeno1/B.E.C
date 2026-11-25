import { TrendReport } from "../types";

const getAuthToken = () => localStorage.getItem('ck-auth-token');

/**
 * Checks and logs AI usage on the backend to enforce limits.
 */
async function checkAndLogUsage(type: 'scan' | 'tryon' | 'advice' | 'dream'): Promise<boolean> {
  try {
    const token = getAuthToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/user/ai-usage', {
      method: 'POST',
      headers,
      body: JSON.stringify({ type })
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    return false;
  }
}

/**
 * Fetches elite styling advice based on user mood and objective.
 */
export const getStylingAdvice = async (mood: string, occasion: string) => {
  if (!(await checkAndLogUsage('advice'))) {
    return "Daily styling allocation exhausted. Upgrade to increase silhouette authority.";
  }

  try {
    const token = getAuthToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/ai/advice', {
      method: 'POST',
      headers,
      body: JSON.stringify({ mood, occasion })
    });
    
    if (!response.ok) return "Neural sensors offline or unreachable.";
    const data = await response.json();
    return data.text || "Maintain baseline silhouette. Neural sensors offline.";
  } catch (error) {
    console.error('AI API error:', error);
    return "Local style buffer overloaded. Silhouette integrity verified.";
  }
};

/**
 * Fetches market trend intelligence.
 */
export const getTrendIntelligence = async (archetype: string): Promise<TrendReport> => {
  return {
    text: `Footwear signals for '${archetype}' point toward earth-toned utility clogs, studded slides, and breathable double-strap sandals built for all-day movement across Ghana.`,
    sources: [{ title: "B.E.C Footwear Studio Feed", uri: "https://becfootwear.gh/collections" }]
  };
};

/**
 * Generates a footwear pairing preview.
 */
export const generateDreamOutfit = async (description: string, highFi: boolean = false) => {
  if (!(await checkAndLogUsage('dream'))) {
    return "/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg";
  }

  try {
    const token = getAuthToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/ai/dream', {
      method: 'POST',
      headers,
      body: JSON.stringify({ description, highFi })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("AI Footwear Blueprint:", data.text);
    }
    
    return "/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg";
  } catch (error) {
    console.error('Dream footwear error:', error);
    return "/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg";
  }
};

export async function generateLookLabOutfit(payload: {
  intention: string;
  prompt?: string;
  occasion?: string;
  budget?: number;
  targetProductId?: string;
  inspirationImage?: string;
  userPassport?: any;
}) {
  const token = getAuthToken();
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/ai/look-lab', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Look Lab generation failed');
  }
  const data = await res.json();
  return data.outfit;
}

