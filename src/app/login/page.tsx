import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authOptions } from '@/server/auth/options';
import NextAuth from 'next-auth';

export default function LoginPage() {
  async function action(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '')
      .trim()
      .toLowerCase();
    const password = String(formData.get('password') || '');
    const { signIn } = NextAuth(authOptions);
    await signIn('credentials', { redirectTo: '/dashboard', email, password });
  }
  return (
    <main className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <Input name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
