import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Something on the right of the title row, e.g. "Ver todo el catálogo ›". */
  aside?: ReactNode;
  /** For a heading inside a section that is not the page's own, e.g. the closing card. */
  as?: 'h2' | 'h3';
}

/**
 * How every section of the home starts: the title says what the section is, on its own,
 * with no small label above it.
 */
export function SectionHeading({ title, subtitle, aside, as: Title = 'h2' }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 max-w-2xl">
        <Title className="text-balance font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.02em] [overflow-wrap:break-word] md:text-[48px]">
          {title}
        </Title>
        {subtitle && <p className="mt-3 max-w-[52ch] text-pretty text-lg text-tinta-medio">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

/** The vertical rhythm every section of the home shares: 128px between sections on a laptop. */
export const sectionSpacing = 'px-4 py-12 md:py-16';

/** The one content width of the home, centred: on a big screen the margins grow, not the page. */
export const homeContainer = 'mx-auto w-full max-w-[75rem]';
