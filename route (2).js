import { prisma } from '@/lib/prisma';
import { isValidToken, SESSION_COOKIE_NAME } from '@/lib/auth';

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const pledges = await prisma.pledge.findMany({ orderBy: { createdAt: 'desc' } });

  const headers = [
    'Donor Name',
    'Contact',
    'Amount Pledged',
    'Amount Received',
    'Payment Method',
    'Status',
    'Notes',
    'Created At',
    'Confirmed At',
  ];

  const rows = pledges.map((p) => [
    p.donorName,
    p.donorContact || '',
    p.amountPledged,
    p.amountReceived,
    p.paymentMethod,
    p.status,
    p.notes || '',
    p.createdAt.toISOString(),
    p.confirmedAt ? p.confirmedAt.toISOString() : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pledges-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
