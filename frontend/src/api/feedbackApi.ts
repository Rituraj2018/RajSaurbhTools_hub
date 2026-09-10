import { axiosClient } from './axiosClient';

export interface FeedbackSubmissionPayload {
  feedbackType: 'bug' | 'feature' | 'improve_tool' | 'new_tool' | 'praise' | 'other';
  rating: number; // 1 to 5
  ratingEmoji: 'poor' | 'okay' | 'good' | 'great' | 'excellent';
  toolId?: string;
  toolName?: string;
  message: string;
  featureTitle?: string;
  featureBenefit?: string;
  newToolName?: string;
  newToolUse?: string;
  expectedResult?: string;
  actualResult?: string;
  email?: string;
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    feedbackType: string;
    rating: number;
    createdAt: string;
  };
}

export const feedbackApi = {
  submitFeedback: async (
    payload: FeedbackSubmissionPayload
  ): Promise<FeedbackSubmissionResponse> => {
    const response = await axiosClient.post<FeedbackSubmissionResponse>('/feedback', payload);
    return response.data;
  },
};
