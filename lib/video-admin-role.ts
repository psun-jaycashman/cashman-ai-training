import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange, type AuthenticatedRequest } from './auth-middleware';

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  if (!auth.roles.includes('admin')) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin role required.' },
      { status: 403 }
    );
  }
  return auth;
}
