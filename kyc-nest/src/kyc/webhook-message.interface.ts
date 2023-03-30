/**
 * Webhook message interface that is sent by the ID verification service. This service is simulated
 * in this project, so it lacks a signature which is normally used to verify the authenticity of
 * the request.
 *
 * Some examples of messages are:
 *
 * Successful verification:
 *
 * {
 *  "userId": "5f9f1b9b-7b1e-4b9f-9f1b-9b7b1e4b9f9f",
 *  "result": "success",
 *  "verificationId": "5f9f1b9b-7b1e-4b9f-9f1b-9b7b1e4b9f9f",
 *  "timestamp": "2020-01-01T00:00:00.000Z"
 * }
 *
 * Rejected verification:
 * {
 *  "userId": "5f9f1b9b-7b1e-4b9f-9f1b-9b7b1e4b9f9f",
 *  "result": "rejected",
 *  "verificationId": "5f9f1b9b-7b1e-4b9f-9f1b-9b7b1e4b9f9f",
 *  "timestamp": "2020-01-01T00:00:00.000Z"
 * }
 */
export interface WebhookMessage {
  userId: string;
  result: 'success' | 'rejected';
  verificationId: string;
  timestamp: string;
}
