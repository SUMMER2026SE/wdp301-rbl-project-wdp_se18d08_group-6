export interface AdvisorProduct {
  garmentId: string;
  name: string;
  imageUrl: string;
  dailyPrice: number;
  depositAmount: number;
  size: string;
  reason: string;
}

export interface AdvisorTopic {
  title: string;
  assistantReply: string;
  recommendedProductIds: string[];
  reasons: Record<string, string>;
  products: AdvisorProduct[];
}

export interface ProductAdvisorResponse {
  topics: AdvisorTopic[];
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
