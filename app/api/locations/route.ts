import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get("query");
  const lang = searchParams.get("lang") || "pt";

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const username = process.env.GEONAMES_USERNAME;

  const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(
    query
  )}&maxRows=8&featureClass=P&style=FULL&lang=${lang}&username=${username}`;

  const response = await fetch(url);
  const data = await response.json();

  const locations =
    data.geonames?.map((item: any) => ({
      id: item.geonameId,
      name: item.name,
      country: item.countryName,
      label: `${item.name}, ${item.countryName}`,
      latitude: item.lat,
      longitude: item.lng,
    })) ?? [];

  return NextResponse.json(locations);
}