const API_URL = import.meta.env.VITE_CLAWBUDDY_API_URL || 'http://localhost:9000';
const WEBHOOK_SECRET = import.meta.env.VITE_CLAWBUDDY_WEBHOOK_SECRET || '';

// @ts-check

/**
 * @typedef {'technical' | 'preference' | 'project' | 'process'} MemoryCategory
 */

/**
 * @typedef {Object} Memory
 * @property {string} id
 * @property {string} content
 * @property {MemoryCategory} category
 * @property {string} agentName
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {Memory[]} [data]
 * @property {string} [error]
 */

// Mock data for when API isn't configured
/** @type {Memory[]} */
const mockMemories = [
  {
    id: 'mock-1',
    content: 'Agent Alpha prefers detailed PR descriptions with test coverage requirements',
    category: 'preference',
    agentName: 'Agent Alpha',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-2',
    content: 'Database migration scripts should always be reviewed by Audit Bot before deployment',
    category: 'process',
    agentName: 'Audit Bot',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-3',
    content: 'Authentication module uses OAuth 2.0 with refresh token rotation',
    category: 'technical',
    agentName: 'Agent Alpha',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-4',
    content: 'Enterprise client discovery calls should last 45 minutes with 15 min follow-up',
    category: 'project',
    agentName: 'Dispatch Bot',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
];

/**
 * Check if the API is properly configured
 * @returns {boolean}
 */
function isApiConfigured() {
  return Boolean(API_URL && WEBHOOK_SECRET && WEBHOOK_SECRET !== 'your_secret_here');
}

/**
 * Submit a new memory to the API
 * @param {string} content
 * @param {MemoryCategory} category
 * @param {string} agentName
 * @returns {Promise<ApiResponse>}
 */
export async function submitMemory(content, category, agentName) {
  if (!isApiConfigured()) {
    // Mock success for development
    const newMemory = {
      id: `mock-${Date.now()}`,
      content,
      category,
      agentName,
      timestamp: new Date().toISOString(),
    };
    mockMemories.unshift(newMemory);
    return { success: true, data: [newMemory] };
  }

  try {
    const response = await fetch(`${API_URL}/functions/v1/ai-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        request_type: 'memory',
        action: 'submit',
        content,
        category,
        agent_name: agentName,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error('Failed to submit memory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit memory',
    };
  }
}

/**
 * List memories from the API with optional filters
 * @param {string} [category]
 * @param {string} [agentName]
 * @returns {Promise<ApiResponse>}
 */
export async function listMemories(category, agentName) {
  if (!isApiConfigured()) {
    // Return filtered mock data
    let filtered = [...mockMemories];
    if (category && category !== 'all') {
      filtered = filtered.filter((m) => m.category === category);
    }
    if (agentName) {
      filtered = filtered.filter((m) =>
        m.agentName.toLowerCase().includes(agentName.toLowerCase())
      );
    }
    return { success: true, data: filtered };
  }

  try {
    const response = await fetch(`${API_URL}/functions/v1/ai-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        request_type: 'memory',
        action: 'list',
        category: category || undefined,
        agent_name: agentName || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error('Failed to list memories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list memories',
    };
  }
}

/**
 * Get API connection status
 * @returns {{ configured: boolean, url: string }}
 */
export function getApiStatus() {
  return {
    configured: isApiConfigured(),
    url: API_URL,
  };
}
