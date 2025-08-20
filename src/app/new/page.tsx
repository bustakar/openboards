import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormClient } from './FormClient';

export default async function NewPostPage() {
  return (
    <main className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit new feature/bug</CardTitle>
          </CardHeader>
          <CardContent>
            <FormClient />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
