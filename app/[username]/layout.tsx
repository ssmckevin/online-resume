import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  
  return {
    title: `${username}`,
    description: `${username}'s profile`
  };
}

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="profile-page">
      {children}
    </div>
  );
}
