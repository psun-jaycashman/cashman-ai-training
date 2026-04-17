import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange, type AuthenticatedRequest } from './auth-middleware';
import { isAdminRole } from './admin-roles';

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin role required.' },
      { status: 403 }
    );
  }
  return auth;
}
