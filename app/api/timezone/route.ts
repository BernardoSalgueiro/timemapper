import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude e longitude são obrigatórias." },
      { status: 400 }
    );
  }

  const username = process.env.GEONAMES_USERNAME;

  const url = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status) {
    return NextResponse.json(
      { error: data.status.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    timezone: data.timezoneId,
    countryName: data.countryName,
    time: data.time,
  });
}