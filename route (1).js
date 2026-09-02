import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const data = {};

  if (body.status) {
    if (!['pledged', 'partially_received', 'received', 'cancelled'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === 'received') {
      data.confirmedAt = new Date();
    }
  }
  if (body.amountReceived !== undefined) {
    const amt = parseFloat(body.amountReceived);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    data.amountReceived = amt;
  }
  if (body.paymentMethod) {
    if (!['venmo', 'cash'].includes(body.paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    data.paymentMethod = body.paymentMethod;
  }
  if (body.notes !== undefined) {
    data.notes = body.notes;
  }

  const pledge = await prisma.pledge.update({ where: { id }, data });
  return NextResponse.json(pledge);
}

export async function DELETE(request, { params }) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  await prisma.pledge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
