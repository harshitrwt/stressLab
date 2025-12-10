export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ ok: true, stored: body });
}

export async function GET() {
  return Response.json({ cached: null });
}
