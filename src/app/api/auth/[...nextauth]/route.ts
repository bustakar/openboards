import { authOptions } from '@/server/auth/options';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);
export const GET = handler.GET;
export const POST = handler.POST;
