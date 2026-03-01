import NavbarWrapper from '@/components/layout/NavbarWrapper'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarWrapper />
      {children}
    </>
  )
}
