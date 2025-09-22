'use server';

export function dashboardFeedbackPath(orgSlug: string) {
  return `/dashboard/${orgSlug}/feedback`;
}

export function publicFeedbackPath(orgSlug: string) {
  return `/${orgSlug}/feedback`;
}
