export interface AIModel {
  id: string;
  name: string;
  provider: string;
  cost: number; // Cost in credits per 1M tokens
  vision: boolean; // Indicates if the model supports image input
}

export const models: AIModel[] = [
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 0731', provider: 'DeepSeek', cost: 350, vision: false },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', cost: 400, vision: true },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', provider: 'Qwen', cost: 400, vision: false },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', cost: 500, vision: true },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'OpenAI', cost: 500, vision: true },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google', cost: 500, vision: true },
  { id: 'deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash 0910', provider: 'DeepSeek', cost: 600, vision: false },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', cost: 600, vision: false },
  { id: 'claude-v4-pro', name: 'Claude V4 Pro', provider: 'Anthropic', cost: 600, vision: true },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'Google', cost: 650, vision: true },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu', cost: 700, vision: false },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google', cost: 700, vision: true },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', provider: 'OpenAI', cost: 800, vision: true },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', cost: 800, vision: true },
  { id: 'grok-4.5', name: 'Grok 4.5 Heavy', provider: 'xAI', cost: 800, vision: false },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google', cost: 800, vision: true },
  { id: 'glm-5.3-flash', name: 'GLM 5.3 Flash', provider: 'Zhipu', cost: 850, vision: false },
  { id: 'grok-4.6', name: 'Grok 4.6 Heavy', provider: 'xAI', cost: 900, vision: false },
];

export const getDefaultModelId = () => {
  return process.env.DEFAULT_MODEL || process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-5.6-luna';
};

export const getModelById = (id: string) => {
  return models.find(m => m.id === id) || models.find(m => m.id === getDefaultModelId()) || models[0];
};
