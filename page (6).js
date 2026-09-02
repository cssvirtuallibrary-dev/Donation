import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}
