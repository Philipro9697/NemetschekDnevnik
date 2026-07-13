import { apiClient } from "./apiClient";
import { FeedbackDto } from "./types";

export const feedbackService = {
	postFeedback: (dto: FeedbackDto) => {
		return apiClient<FeedbackDto>("/feedback", {
			method: "POST",
			body: JSON.stringify(dto),
		});
	},
};
