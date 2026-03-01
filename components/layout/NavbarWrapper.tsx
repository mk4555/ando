import { createServerClient } from '@/lib/supabase/server'
import Navbar from './Navbar'

export default async function NavbarWrapper() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <Navbar isLoggedIn={!!user} />
}
