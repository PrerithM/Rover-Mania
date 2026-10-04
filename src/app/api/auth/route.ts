import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { password, action } = body;

        if (action === "logout") {
            const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });
            response.cookies.set({
                name: "rover_auth",
                value: "",
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 0,
                expires: new Date(0)
            });
            return response;
        }

        if (password === "PrerithRover") {
            const response = NextResponse.json({ success: true }, { status: 200 });
            response.cookies.set({
                name: "rover_auth",
                value: "authenticated",
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return response;
        }

        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    } catch {
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("rover_auth")?.value;
    if (token === "authenticated") {
        return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
    response.cookies.set({
        name: "rover_auth",
        value: "",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        expires: new Date(0)
    });
    return response;
}
