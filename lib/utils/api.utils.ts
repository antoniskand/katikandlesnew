import { NextResponse } from "next/server"
import { ApiError, type ApiResponse } from "@/types/api"

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(data: T, status = 200, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: status >= 200 && status < 300,
      message,
    },
    { status },
  )
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, defaultMessage = "An error occurred"): NextResponse<ApiResponse> {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        success: false,
        details: error.details,
      },
      { status: error.statusCode },
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || defaultMessage,
        success: false,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      error: defaultMessage,
      success: false,
    },
    { status: 500 },
  )
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T extends Record<string, any>>(searchParams: URLSearchParams, defaults: T): T {
  const result = { ...defaults }

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const value = searchParams.get(key)

    if (value === null || value === "undefined") {
      continue
    }

    // Type conversion based on default value type
    if (typeof defaultValue === "number") {
      const parsed = Number(value)
      if (!isNaN(parsed)) {
        result[key as keyof T] = parsed as any
      }
    } else if (typeof defaultValue === "boolean") {
      result[key as keyof T] = (value === "true") as any
    } else {
      result[key as keyof T] = value as any
    }
  }

  return result
}
