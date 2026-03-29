/**
 * Shared API request/response types for all route handlers.
 * Centralizes type definitions to ensure consistency across endpoints.
 * Zod schemas for runtime validation + TypeScript types for compile-time safety.
 */

import { z } from "zod";

/* ─── XSS Sanitizer ─── */

/** Strip HTML tags and dangerous characters from user input */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/* ─── Zod Schemas ─── */

const skinTypeEnum = z.enum(["oily", "dry", "combination", "sensitive", "normal"]);

export const createRoutinePostSchema = z.object({
  skin_type: skinTypeEnum,
  concerns: z.array(z.string().min(1).max(50)).min(1).max(20),
  score: z.number().int().min(0).max(100),
  products_json: z.unknown().refine((v) => v !== null && v !== undefined, "products_json is required"),
  comment: z.string().max(500).optional(),
  rating: z.number().int().min(1).max(5),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const confirmPaymentSchema = z.object({
  paymentKey: z.string().min(1).max(200),
  orderId: z.string().min(1).max(200),
  amount: z.number().positive().finite(),
});

export const logSearchSchema = z.object({
  query: z.string().min(1).max(200),
  results_count: z.number().int().min(0).default(0),
  selected_product_id: z.string().max(200).nullable().default(null),
  fell_through: z.boolean().default(false),
});

const funnelEventSchema = z.object({
  event_name: z.string().min(1).max(100),
  session_id: z.string().min(1).max(200),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_at: z.string().min(1).max(50),
});

export const batchEventsSchema = z.object({
  events: z.array(funnelEventSchema).min(1).max(100),
});

export const feedbackSchema = z.object({
  conflict_rule_id: z.string().min(1).max(200),
  is_helpful: z.boolean(),
  session_id: z.string().min(1).max(200),
});

export const productCandidateSchema = z.object({
  brand: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  category_guess: z.string().max(50).nullable().optional(),
});

export const updateCandidateSchema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["approved", "rejected", "pending"]),
});

/** Parse Zod result and return formatted error or null */
export function parseWithZod<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data };
  }
  const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return { error: messages };
}

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

/* ─── /api/points ─── */

export const earnPointsSchema = z.object({
  action: z.string().min(1).max(50),
  reference_id: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const redeemPointsSchema = z.object({
  points: z.number().int().positive().max(100000),
  description: z.string().min(1).max(200),
});

export interface PointBalanceResponse {
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  dailyEarned: number;
  dailyRemaining: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PointTransactionItem {
  id: string;
  action: string;
  points: number;
  referenceId: string | null;
  description: string;
  createdAt: string;
}

export interface PointHistoryResponse {
  transactions: PointTransactionItem[];
  total: number;
  page: number;
  limit: number;
}

export interface EarnPointsResponse extends ApiOk {
  earned: number;
  newBalance: number;
  dailyEarned: number;
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
