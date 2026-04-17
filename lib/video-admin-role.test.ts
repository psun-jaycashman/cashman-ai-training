import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from './video-admin-role';

vi.mock('./auth-middleware', () => ({
  requireAuthWithTokenExchange: vi.fn(),
}));
import { requireAuthWithTokenExchange } from './auth-middleware';

const mockReq = () => new NextRequest('http://localhost/api/admin/training-videos');

describe('requireAdmin', () => {
  it('returns 401 response when auth middleware returns NextResponse', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 401 }));
    const result = await requireAdmin(mockReq());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 403 when user lacks admin role', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['user'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('returns auth info when user has admin role', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['user', 'admin'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { userId: string }).userId).toBe('u');
  });

  it('accepts capitalised Admin role (case-insensitive)', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['Admin'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).not.toBeInstanceOf(NextResponse);
  });

  it('accepts namespaced app:cashman-ai-training:admin role', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['app:cashman-ai-training:admin'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).not.toBeInstanceOf(NextResponse);
  });
});
