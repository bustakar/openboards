import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewPostPage() {
  return (
    <main className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit new feature/bug</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input name="title" placeholder="Short, descriptive title" required maxLength={120} />
                <div className="text-xs text-muted-foreground mt-1">Up to 120 characters</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Details (optional)</label>
                <Textarea name="body" placeholder="Describe your request or report" maxLength={10000} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


