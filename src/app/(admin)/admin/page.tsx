import { redirect } from 'next/navigation';

// The dashboard arrives in fase 7; until then the panel opens on products.
export default function AdminHome() {
  redirect('/admin/productos');
}
