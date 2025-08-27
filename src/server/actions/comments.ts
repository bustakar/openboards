'use server';

export async function createCommentAction(postId: string, formData: FormData) {
  const body = String(formData.get('body') || '').trim();
  const authorName =
    String(formData.get('authorName') || '').trim() || undefined;
  if (!body) return;
  
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/posts/${postId}/comments`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body, authorName }),
    }
  );
  
  // Best-effort revalidation for pages under /b
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/b');
  } catch {}
}
