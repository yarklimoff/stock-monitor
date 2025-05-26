import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

  try {
    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=7&apikey=${apiKey}`,
    );
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
