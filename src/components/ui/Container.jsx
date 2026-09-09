import { cn } from '../../lib/cn';

/**
 * The single horizontal rhythm for the whole site.
 * Every section uses this so gutters never drift out of alignment.
 */
export default function Container({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8', className)} {...props}>
      {children}
    </Tag>
  );
}
