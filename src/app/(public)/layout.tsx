import { Nav } from '@/components/Nav';
import { NewPostSheet } from '@/components/posts/NewPostSheet';
import { PostSheet } from '@/components/posts/PostSheet';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  // If no project found, return 404
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav title={project.name} />
      {children}
      <NewPostSheet />
      <PostSheet />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: project.name,
    description:
      project.description ||
      `Feedback and feature requests for ${project.name}`,
    openGraph: {
      title: project.name,
      description:
        project.description ||
        `Feedback and feature requests for ${project.name}`,
      type: 'website',
    },
  };
}
