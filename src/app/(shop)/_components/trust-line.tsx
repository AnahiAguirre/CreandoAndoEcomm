export const TRUST = ['Retiro gratis', 'Envíos a todo el país', 'Compra segura con Mercado Pago'];

/** The doubts before paying, answered in one line, right under the first screen. */
export function TrustLine({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-tinta-medio ${className}`}>
      {TRUST.map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-verde">
            ✓
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
