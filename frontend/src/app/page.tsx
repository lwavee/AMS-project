import { redirect } from 'next/navigation';

export default function RootPage() {
  // Since we use client-side authentication via localStorage in this app,
  // we redirect the root to /login and let the login page or client-side logic
  // handle the correct dashboard redirection based on the saved role.
  redirect('/login');
}
