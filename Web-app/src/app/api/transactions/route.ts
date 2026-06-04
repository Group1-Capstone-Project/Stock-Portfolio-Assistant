// temporary transactions route placeholder
// keeps the API route valid until transaction logic is implemented
// it prevents an empty route.ts file from causing runtime issues

export async function GET() {
  return Response.json(
    { message: "Transactions route is not implemented yet." },
    { status: 501 }
  );
}