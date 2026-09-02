import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pledges = await prisma.pledge.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(pledges);
}

export async function POST(request) {
  const body = await request.json();
  const { donorName, donorContact, amountPledged, paymentMethod, notes } = body;

  if (!donorName || !amountPledged || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!['venmo', 'cash'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }
  const amount = parseFloat(amountPledged);
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const pledge = await prisma.pledge.create({
    data: {
      donorName,
      donorContact: donorContact || null,
      amountPledged: amount,
      paymentMethod,
      notes: notes || null,
      status: 'pledged',
    },
  });

  return NextResponse.json(pledge, { status: 201 });
}
