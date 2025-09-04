'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col gap-4">
      You're successfully logged in! This is your dashboard.
      <Button onClick={handleLogout} disabled={isLoading} variant="outline">
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  );
}
