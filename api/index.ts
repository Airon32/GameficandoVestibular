import type { Request, Response } from 'express';

export default async function handler(request: Request, response: Response) {
  try {
    const { default: app } = await import('../server');
    return app(request, response);
  } catch (error) {
    console.error('API module initialization failed:', error);
    return response.status(500).json({
      error: 'API_INIT_FAILED',
      message: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.stack : undefined,
    });
  }
}
