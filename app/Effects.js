'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initGlobal, initPage, finishTransition, pageName } from '../lib/site';

export default function Effects() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initGlobal(router);
  }, [router]);

  useEffect(() => {
    const cleanup = initPage(pageName(pathname));
    const t = setTimeout(finishTransition, 60);
    return () => { clearTimeout(t); cleanup(); };
  }, [pathname]);

  return null;
}
