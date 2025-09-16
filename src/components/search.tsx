'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export function Search({ initial }: { initial?: string }) {
  const [value, setValue] = useState(initial || '');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const search = value.trim();
      if (search) params.set('search', search);
      else params.delete('search');
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="max-w-sm w-full">
      <Input
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
