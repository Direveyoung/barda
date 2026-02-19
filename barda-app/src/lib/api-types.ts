/**
 * Shared API request/response types for all route handlers.
 * Centralizes type definitions to ensure consistency across endpoints.
 */

/* ─── Common Response Types ─── */

export interface ApiError {
  error: string;
  detail?: unknown;
}

export interface ApiOk {
  ok: true;
}

/* ─── /api/routines ─── */

export interface RoutinePostResponse {
  id: string;
  user_id: string;
  skin_type: string;
  concerns: string[];
  score: number;
  products_json: unknown;
  comment: string | null;
  rating: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  user_email_prefix: string;
}

export interface RoutinePostListResponse {
  posts: RoutinePostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRoutinePostRequest {
  skin_type: string;
  concerns: string[];
  score: number;
  products_json: unknown;
  comment?: string;
  rating: number;
}

export interface CreateRoutinePostResponse extends ApiOk {
  post: unknown;
}

/* ─── /api/routines/[id]/like ─── */

export interface LikeToggleResponse {
  liked: boolean;
}

/* ─── /api/routines/[id]/comments ─── */

export interface CommentListResponse {
  comments: unknown[];
  total: number;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse extends ApiOk {
  comment: unknown;
}

/* ─── /api/payments/confirm ─── */

export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ConfirmPaymentResponse {
  success: true;
  payment: unknown;
}

/* ─── /api/search-logs ─── */

export interface LogSearchRequest {
  query: string;
  results_count?: number;
  selected_product_id?: string | null;
  fell_through?: boolean;
}

export interface SearchStatsResponse {
  totalSearches: number;
  missedSearches: number;
  hitRate: number;
}

export interface MissedQuery {
  query: string;
  count: number;
}

export interface MissedSearchesResponse {
  missed: MissedQuery[];
}

/* ─── /api/events ─── */

export interface FunnelEvent {
  event_name: string;
  session_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface BatchEventsRequest {
  events: FunnelEvent[];
}

export interface BatchEventsResponse extends ApiOk {
  count: number;
}

/* ─── /api/feedback ─── */

export interface FeedbackRequest {
  conflict_rule_id: string;
  is_helpful: boolean;
  session_id: string;
}

/* ─── /api/product-candidates ─── */

export interface ProductCandidateRequest {
  brand: string;
  name: string;
  category_guess?: string | null;
}

export interface ProductCandidateResponse extends ApiOk {
  action: "created" | "incremented";
  id: string;
}

export interface ProductCandidateListResponse {
  candidates: unknown[];
}

export interface UpdateCandidateRequest {
  id: string;
  status: "approved" | "rejected" | "pending";
}

/* ─── /api/barcode ─── */

export interface BarcodeResponse {
  product: unknown;
  source: string;
  timestamp?: string;
}

/* ─── /api/admin/stats ─── */

export interface AdminStatsResponse {
  totalUsers: number;
  totalRoutines: number;
  totalPayments: number;
  totalPosts: number;
  searchStats: SearchStatsResponse;
}

/* ─── Validation Helpers ─── */

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0 && Number.isFinite(value);
}

export function isValidBarcode(code: string): boolean {
  return /^\d{8,14}$/.test(code);
}

export function isValidSkinType(value: unknown): value is string {
  const validTypes = ["oily", "dry", "combination", "sensitive", "normal"];
  return typeof value === "string" && validTypes.includes(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function isValidRating(value: unknown): value is number {
  return typeof value === "number" && value >= 1 && value <= 5 && Number.isInteger(value);
}

export function isValidCandidateStatus(
  value: unknown
): value is "approved" | "rejected" | "pending" {
  return typeof value === "string" && ["approved", "rejected", "pending"].includes(value);
}
