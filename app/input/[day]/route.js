import path from "path";
import fs from "fs/promises";

import { NextResponse } from "next/server";

export async function GET(request) {
    const filename = new URL(request.url).pathname.split("/").at(-1);
    if (filename.includes(".")) throw new Error("Nice try");

    try {
        const fullPath = path.join(process.cwd(), "app", "input", "data", `${filename}.txt`);
        const file = await fs.readFile(fullPath, "utf8");
        const rawText = file.trim();

        return NextResponse.json({ rawText });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
