
import { env } from "@lib/utils";

// converts IPv6 to IPv4
export function normalizeIp(ip: string): string {
    
    // IPv4-mapped IPv6 -> IPv4
    if (ip.startsWith("::ffff:")) return ip.slice(7);

    return ip;
}

// checks was request from localhost sent
export function isFromLocalhost(senderIP: string): boolean {
    const ip = normalizeIp(senderIP);

    if (ip === "127.0.0.1") return true; // IPv4 

    if (ip === "::1") return true; // IPv6

    return false;
}

// checks is request from backend sent
export function isSentFromBackend(senderIP: string): boolean {
    return senderIP == env("BACKEND_IP") || isFromLocalhost(senderIP)
}


// parses jwt token from header ( deletes 'Bearer' keyword )
export function getJWTFromHeader(header: string): string {
    return header.replace("Bearer ", "")
}

export function separateJWT(jwt: string){
    const [ header, payload, sign ] = jwt.split(".");
    
    return { header, payload, sign };
}