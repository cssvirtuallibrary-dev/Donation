import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const pledges = await prisma.pledge.findMany({
    where: { status: { not: 'cancelled' } },
    select: { amountPledged: true, amountReceived: true },
  });

  const totalPledged = pledges.reduce((s, p) => s + Number(p.amountPledged), 0);
  const totalReceived = pledges.reduce((s, p) => s + Number(p.amountReceived), 0);

  return NextResponse.json({
    totalPledged,
    totalReceived,
    pledgeCount: pledges.length,
  });
}
