import type { ReactNode } from 'react';

interface Props {
  /** The small blue line above the title. */
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Something on the right of the title row, e.g. "Ver todo el catálogo ›". */
  aside?: ReactNode;
  /** For a heading inside a section that is not the page's own, e.g. the closing card. */
  as?: 'h2' | 'h3';
}

/** How every section of the home starts: same eyebrow, same title size, same alignment. */
export function SectionHeading({ eyebrow, title, subtitle, aside, as: Title = 'h2' }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-azul">{eyebrow}</p>
        <Title className="mt-2 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[40px]">
          {title}
        </Title>
        {subtitle && <p className="mt-3 text-balance text-lg text-tinta-medio">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

/** The vertical rhythm every section of the home shares. */
export const sectionSpacing = 'px-4 py-12 md:py-[72px]';
