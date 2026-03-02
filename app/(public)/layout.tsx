import NavbarWrapper from '@/components/layout/NavbarWrapper'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarWrapper />
      {children}
    </>
  )
}
