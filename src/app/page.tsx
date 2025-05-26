'use client';

import { useState } from 'react';

import cn from './page.module.scss';
import StockChart from '@/features/StockChart/StockChart';
import StockTable from '@/features/StockTable/StockTable';

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>();
  const onSelectSymbol = (value: string) => {
    setSelectedSymbol(value);
  };
  return (
    <main className={cn.container}>
      <h1>Биржевой монитор</h1>

      <StockTable onSelectSymbol={onSelectSymbol} />

      <div>
        <h2>График цены акции</h2>
        <StockChart symbol={selectedSymbol} />
      </div>
    </main>
  );
}
