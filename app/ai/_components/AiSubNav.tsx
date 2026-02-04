'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AiSubNav() {
  const pathname = usePathname();
  
  const menus = [
    { name: 'WORK', href: '/ai' },
    { name: 'LAB', href: '/ai/lab' },
    { name: 'ARTICLE', href: '/ai/article' },
  ];

  return (
    <nav className="flex justify-center items-center gap-12 my-10 border-b border-white/10 pb-6">
      {menus.map((menu) => {
        const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/');
        return (
          <Link 
            key={menu.href} 
            href={menu.href}
            className={`text-lg font-bold tracking-[0.2em] transition-all ${
              isActive ? 'text-yellow-400 scale-110' : 'text-gray-500 hover:text-white'
            }`}
          >
            {menu.name}
          </Link>
        );
      })}
    </nav>
  );
}