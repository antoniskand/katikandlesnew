import { ApiError } from "@/types/api"

export class ErrorHandler {
  static handle(error: unknown, context: string): never {
    console.error(`[${context}] Error:`, error)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, 500, { originalError: error.name })
    }

    throw new ApiError("An unexpected error occurred", 500)
  }

  static async handleAsync<T>(promise: Promise<T>, context: string): Promise<T> {
    try {
      return await promise
    } catch (error) {
      this.handle(error, context)
    }
  }
}
