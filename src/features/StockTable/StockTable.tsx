'use client';

import { Input, message, Radio, RadioChangeEvent, Table } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import cn from './StockTable.module.scss';
import { ColumnsType } from 'antd/es/table';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import axios from 'axios';
type Stock = {
  symbol: string;
  name: string;
  price: number;
  percent_change: number;
  open: number;
};

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'Все', value: 'all' },
  { label: 'Растущие', value: 'up' },
  { label: 'Падающие', value: 'down' },
];

const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

type StockTableProps = {
  onSelectSymbol: (value: string) => void;
};

const StockTable: FC<StockTableProps> = ({ onSelectSymbol }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');
  const [search, setSearch] = useState('');
  const filteredStocks = stocks
    .filter((stock) => {
      const isUp = stock.price > stock.open;
      const isDown = stock.price < stock.open;

      if (filter === 'up') return isUp;
      if (filter === 'down') return isDown;
      return true;
    })
    .filter((stock) => stock.symbol.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnsType<Stock> = [
    {
      title: 'Символ',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Цена ($)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Изменение (%)',
      dataIndex: 'percent_change',
      key: 'percent_change',
      align: 'right',
      sorter: (a, b) => a.percent_change - b.percent_change,
      render: (percent) => (
        <span className={percent >= 0 ? cn.green : cn.red}>
          {percent >= 0 ? '+' : ''}
          {percent.toFixed(2)}%
        </span>
      ),
    },
  ];
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const res = await axios.get(`/api/stock-data?symbol=${symbol}`);
            const json = res.data;
            return {
              key: symbol,
              symbol,
              name: json.name,
              price: json.price,
              percent_change: json.percent_change,
              open: json.open,
            };
          } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            message.warning(`Не удалось загрузить данные для ${symbol}`);
            return {
              key: symbol,
              symbol,
              name: '',
              price: 0,
              percent_change: 0,
              open: 0,
            };
          }
        }),
      );
      setStocks(data);
    } catch (error) {
      console.error('General fetching error:', error);
      message.error('Произошла ошибка при загрузке данных');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return (
    <div className={cn.container}>
      <div className={cn.controls}>
        <Input
          placeholder="Поиск по символу"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Radio.Group
          block
          options={options}
          defaultValue="all"
          optionType="button"
          buttonStyle="solid"
          onChange={(e: RadioChangeEvent) => {
            setFilter(e.target.value);
          }}
        />
      </div>

      <Table
        dataSource={filteredStocks}
        columns={columns}
        pagination={false}
        loading={loading}
        onRow={(record) => ({
          className: cn.row,
          onClick: () => {
            onSelectSymbol(record.symbol);
          },
        })}
      />
    </div>
  );
};

export default StockTable;
