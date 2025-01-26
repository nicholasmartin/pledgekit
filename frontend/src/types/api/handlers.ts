/**
 * API Handler Types
 * 
 * This file contains type definitions for Next.js API route handlers.
 * It includes common types and utilities for handling API requests and responses.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

export type RouteHandler<T> = (
  req: Request,
  params?: { params: Record<string, string> }
) => Promise<NextResponse<T>>
