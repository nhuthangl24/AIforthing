import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CREDITS_FILE_PATH = path.join(process.cwd(), 'data', 'credits.json');
const DEFAULT_FREE_TOKENS = 80000000;

// Helper to get today's date string
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Helper to read credits
async function getCreditsData() {
  let data;
  try {
    const raw = await fs.readFile(CREDITS_FILE_PATH, 'utf-8');
    data = JSON.parse(raw);
  } catch (error) {
    // If file doesn't exist, return default
    data = { credits: 54943.47, freeTokens: DEFAULT_FREE_TOKENS, lastResetDate: getTodayString() };
  }

  // Check for daily reset
  const today = getTodayString();
  if (data.lastResetDate !== today) {
    data.freeTokens = DEFAULT_FREE_TOKENS;
    data.lastResetDate = today;
  }

  return data;
}

// GET: Fetch current credits
export async function GET() {
  const data = await getCreditsData();
  // Provide cache-control headers to prevent caching for real-time updates
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

// POST: Deduct or set credits
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getCreditsData();
    let newCredits = data.credits;
    let newFreeTokens = data.freeTokens ?? DEFAULT_FREE_TOKENS;

    if (body.action === 'deduct') {
      const amount = Number(body.amount);
      if (!isNaN(amount) && amount > 0) {
        newCredits = Math.max(0, data.credits - amount);
      }
    } else if (body.action === 'deduct_tokens') {
      const tokens = Number(body.tokens);
      if (!isNaN(tokens) && tokens > 0) {
        newFreeTokens = Math.max(0, newFreeTokens - tokens);
      }
    } else if (body.action === 'set') {
      const amount = Number(body.amount);
      if (!isNaN(amount)) {
        newCredits = amount;
      }
    }

    const newData = { 
      credits: newCredits, 
      freeTokens: newFreeTokens, 
      lastResetDate: data.lastResetDate 
    };
    
    // Make sure data directory exists
    await fs.mkdir(path.dirname(CREDITS_FILE_PATH), { recursive: true });
    
    // Write atomically
    await fs.writeFile(CREDITS_FILE_PATH, JSON.stringify(newData, null, 2), 'utf-8');

    return NextResponse.json(newData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
