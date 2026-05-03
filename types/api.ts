// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  page: number
  pages: number
  limit: number
}

// Request Parameter Types
export interface ProductQueryParams {
  limit?: number
  page?: number
  category?: string
  search?: string
  sort?: string
  active?: boolean
  attributeFilters?: Record<string, string>
}

export interface CartUpdateRequest {
  itemId: string
  quantity: number
}

export interface CartAddRequest {
  productId: string
  quantity?: number
  variantId?: string
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
