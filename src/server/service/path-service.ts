'use server';

export async function dashboardFeedbackPath(orgSlug: string) {
  return `/dashboard/${orgSlug}/feedback`;
}

export async function publicFeedbackPath() {
  return `/feedback`;
}
