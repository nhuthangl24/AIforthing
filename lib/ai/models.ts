export interface AIModel {
  id: string;
  name: string;
  provider: string;
  cost: number; // Cost in credits per 1M tokens
  vision: boolean; // Indicates if the model supports image input
  description?: string; // Short description of the model
}

export const models: AIModel[] = [
  // Kira AI Free Models
  { id: 'kira-mini-1.0', name: 'Kira Mini 1.0', provider: 'Kira AI', cost: 0, vision: false, description: 'Mô hình AI miễn phí của KiraAI, đa năng, phù hợp cho hội thoại hàng ngày. Không tốn lượt token.' },
  { id: 'mimo-v2.5-free', name: 'Mimo V2.5 Free', provider: 'Kira AI', cost: 0, vision: false, description: 'Mimo V2.5 là mô hình tiệm cận cao cấp, tối ưu chi phí với khả năng suy luận mạnh mẽ và xử lý ngữ cảnh mượt mà.' },
  { id: 'hy3-free', name: 'Tencent: Hy3 Free', provider: 'Kira AI', cost: 0, vision: false, description: 'Tencent: Hy3 Free là mô hình AI thương mại cao cấp của Tencent với khả năng lập trình Agent vượt trội.' },
  { id: 'qwen3.8-flash-free', name: 'Qwen3.8 Flash Free', provider: 'Kira AI', cost: 0, vision: false, description: 'Qwen3.8-Flash là mô hình đa phương thức giá siêu rẻ từ Alibaba, chuyên phục vụ lập trình và xử lý ngôn ngữ.' },
  { id: 'glm-5.3-free', name: 'GLM 5.3 Free', provider: 'Kira AI', cost: 0, vision: false, description: 'GLM 5.3 là mô hình ngôn ngữ lớn tiên tiến sở hữu khả năng hiểu và tạo văn bản song ngữ cực kỳ linh hoạt.' },
  
  // HHTECH Models
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 0731', provider: 'DeepSeek', cost: 350, vision: false, description: 'Mô hình xử lý văn bản tốc độ cao từ DeepSeek, tối ưu cho tác vụ lập trình và suy luận logic cơ bản.' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', cost: 400, vision: true, description: 'Mô hình nhanh nhất và nhỏ gọn nhất của Anthropic, hỗ trợ phân tích hình ảnh đa phương thức.' },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', provider: 'Qwen', cost: 400, vision: false, description: 'Mô hình chuyên biệt về lập trình từ Qwen, sở hữu khả năng sinh code và review code ấn tượng.' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', cost: 500, vision: true, description: 'Mô hình cân bằng hoàn hảo giữa tốc độ và hiệu suất, xuất sắc trong phân tích hình ảnh và tài liệu.' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'OpenAI', cost: 500, vision: true, description: 'Mô hình ngôn ngữ mới nhất từ OpenAI, phản hồi nhanh nhạy và thông minh cho đa tác vụ hàng ngày.' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google', cost: 500, vision: true, description: 'Mô hình tốc độ cao đa phương thức từ Google, khả năng xử lý hình ảnh và video vượt trội.' },
  { id: 'deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash 0910', provider: 'DeepSeek', cost: 600, vision: false, description: 'Phiên bản cải tiến V4.1 của DeepSeek Flash, tăng cường khả năng suy luận logic nhiều bước.' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', cost: 600, vision: false, description: 'Mô hình cao cấp nhất của DeepSeek, mạnh mẽ về lập trình, toán học và suy luận phức tạp.' },
  { id: 'claude-v4-pro', name: 'Claude V4 Pro', provider: 'Anthropic', cost: 600, vision: true, description: 'Mô hình mạnh nhất của Anthropic, vượt trội trong tư duy hệ thống và xử lý lượng dữ liệu khổng lồ.' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'Google', cost: 650, vision: true, description: 'Phiên bản nâng cấp V3.7 của Gemini Flash, cải thiện đáng kể độ chính xác trong xử lý hình ảnh.' },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu', cost: 700, vision: false, description: 'Mô hình ngôn ngữ tiên tiến của Zhipu AI, chuyên phân tích ngữ nghĩa tiếng Việt và tiếng Trung.' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google', cost: 700, vision: true, description: 'Bản nâng cấp V3.8 của Gemini Flash, hiệu năng tiệm cận bản Pro với tốc độ cực nhanh.' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', provider: 'OpenAI', cost: 800, vision: true, description: 'Phiên bản Terra chuyên xử lý luồng ngữ cảnh siêu lớn và phân tích văn bản chuyên sâu.' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', cost: 800, vision: true, description: 'Mô hình trí tuệ nhân tạo toàn diện và ổn định, chuẩn mực cho mọi tác vụ phức tạp.' },
  { id: 'grok-4.5', name: 'Grok 4.5 Heavy', provider: 'xAI', cost: 800, vision: false, description: 'Mô hình ngôn ngữ lớn từ xAI, không kiểm duyệt gắt gao, trả lời trực diện và chính xác.' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google', cost: 800, vision: true, description: 'Mô hình cao cấp nhất từ Google, sức mạnh đa phương thức số 1 thế giới.' },
  { id: 'glm-5.3-flash', name: 'GLM 5.3 Flash', provider: 'Zhipu', cost: 850, vision: false, description: 'Bản Flash V5.3 của Zhipu, khả năng phản hồi tốc độ ánh sáng cho ứng dụng thời gian thực.' },
  { id: 'grok-4.6', name: 'Grok 4.6 Heavy', provider: 'xAI', cost: 900, vision: false, description: 'Bản cập nhật V4.6 siêu mạnh từ xAI, dẫn đầu về lý luận logic và tư duy độc lập.' },
];

export const getDefaultModelId = () => {
  return process.env.DEFAULT_MODEL || process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-5.6-luna';
};

export const getModelById = (id: string) => {
  return models.find(m => m.id === id) || models.find(m => m.id === getDefaultModelId()) || models[0];
};
