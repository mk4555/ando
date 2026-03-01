import NavbarWrapper from '@/components/layout/NavbarWrapper'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarWrapper />
      {children}
    </>
  )
}
