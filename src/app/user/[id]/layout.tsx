import NavbarProfile from '@/components/NavbarProfile';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarProfile />
      {children}
    </>
  );
} 