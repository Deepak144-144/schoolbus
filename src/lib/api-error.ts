import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  const isDev = process.env.NODE_ENV === 'development'
  
  if (error instanceof ApiError) {
    if (isDev) console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message, code: error.code, details: isDev ? error.details : undefined },
      { status: error.statusCode }
    )
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }

  if (isDev) console.error('API Error:', error)
  return NextResponse.json(
    { 
      error: 'Internal server error',
      ...(isDev && { details: error instanceof Error ? error.message : String(error) })
    },
    { status: 500 }
  )
}

export function createErrorResponse(message: string, statusCode: number = 500, code?: string, details?: unknown) {
  return NextResponse.json(
    { error: message, code, details },
    { status: statusCode }
  )
}