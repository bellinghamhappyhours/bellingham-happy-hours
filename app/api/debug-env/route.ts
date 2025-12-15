import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    sheetEnv: process.env.SHEET_CSV_URL ?? null,
  });
}