export function SiteFooter() {
  return (
    <footer className="bg-arena">
      <div className="mx-auto flex min-h-[120px] max-w-[70rem] flex-wrap items-center justify-between gap-2 px-4 py-6 text-[13px] text-tinta-soft">
        <span>© {new Date().getFullYear()} CreandoAndo</span>
        <span>Juguetes de madera e imprimibles para colorear</span>
      </div>
    </footer>
  );
}
