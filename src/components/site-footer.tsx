export function SiteFooter() {
  return (
    <footer className="bg-elegidos-fondo">
      <div className="mx-auto flex max-w-[75rem] flex-wrap items-center justify-between gap-2 px-4 py-10 text-sm text-tinta-soft">
        <span>© {new Date().getFullYear()} CreandoAndo</span>
        <span>Juguetes de madera e imprimibles para colorear</span>
      </div>
    </footer>
  );
}
