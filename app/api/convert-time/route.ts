import { NextResponse } from "next/server";
import { DateTime } from "luxon";

export async function POST(request: Request) {
    const {time, fromTimezone, toTimezone} = await request.json();

    if (!time || !fromTimezone || !toTimezone) {
        return NextResponse.json(
            {error: "Dados incompletos"},
            {status: 400}
        );
    }

    const converted = DateTime.fromFormat(time, "HH:mm", {
        zone: fromTimezone,
    }).setZone(toTimezone);

    if (!converted.isValid) {
        return NextResponse.json(
            {error: "Horário inválido"},
            {status: 400}
        );
    }

    return NextResponse.json({
        result: converted.toFormat("HH:mm"),
    });
}