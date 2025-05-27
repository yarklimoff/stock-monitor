import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Symbol parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await axios.get(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`,
    );

    if (response.data.status === 'error') {
      return new Response(
        JSON.stringify({
          error: response.data.message || 'API error',
          code: response.data.code || 500,
        }),
        {
          status: response.data.code === 429 ? 429 : 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const formattedData = {
      symbol: response.data.symbol,
      name: response.data.name,
      price: parseFloat(response.data.close),
      percent_change: parseFloat(response.data.percent_change),
      open: parseFloat(response.data.open),
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = 'Ошибка сервера';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
