'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  children: ReactNode;
  disabled?: boolean;
};

export default function NavLink({
  href,
  children,
  className,
  disabled,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = !disabled && (
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  );

  return (
    <Link
      href={disabled ? '#' : href}
      className={cn(disabled && 'pointer-events-none opacity-50')}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      <SidebarMenuButton isActive={isActive} className={className}>
        {children}
      </SidebarMenuButton>
    </Link>
  );
}
