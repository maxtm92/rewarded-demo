'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function PaginationControls({ currentPage, totalPages, totalItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-400">
        {totalItems} total &middot; Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg bg-[#2f3043] text-gray-300 hover:bg-[#42435a] transition disabled:opacity-30"
        >
          Prev
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-[#2f3043] text-gray-300 hover:bg-[#42435a] transition disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
