
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET || "secret_key_change_me_in_prod";
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function updateSession(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return;

    // Refresh token expiration if valid
    const parsed = await verifyToken(token);
    if (!parsed) return;

    const res = NextResponse.next();
    res.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res;
}
