import { createAdminSupabase } from "@/lib/supabase/server";
import { verifyOnChain, getStellarLabUrl } from "@/lib/stellar";
import { NextResponse } from "next/server";
import type { VerifyResponse } from "@/types";

/**
 * GET /api/verify/[recordHash] — Public verification endpoint.
 *
 * Checks both the database and the Soroban contract to verify
 * if an attendance record exists. Returns status + Stellar Lab link.
 *
 * This is PUBLIC — no authentication required.
 */
export async function GET(
  _request: Request,
  { params }: { params: { recordHash: string } }
) {
  try {
    const { recordHash } = params;

    if (!recordHash || recordHash.length !== 64) {
      return NextResponse.json(
        { error: "Hash inválido. Debe ser un hash SHA-256 de 64 caracteres." },
        { status: 400 }
      );
    }

    const admin = createAdminSupabase();

    // Check database
    const { data: checkin } = await admin
      .from("checkins")
      .select("*, attendees(display_name), sessions(*, classes(title))")
      .eq("record_hash", recordHash)
      .single();

    // Check on-chain (even if not in DB, the contract is the source of truth)
    let onchainExists = false;
    try {
      const result = await verifyOnChain(recordHash);
      onchainExists = result.exists;
    } catch {
      // Contract might not be deployed yet — that's OK
    }

    const response: VerifyResponse = {
      exists: !!checkin || onchainExists,
      recordHash,
      onchainStatus: checkin?.onchain_status || (onchainExists ? "SUCCESS" : null),
      txHash: checkin?.tx_hash || null,
      stellarLabUrl: checkin?.tx_hash
        ? getStellarLabUrl(checkin.tx_hash)
        : null,
      timestamp: checkin?.created_at || null,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Error al verificar el registro." },
      { status: 500 }
    );
  }
}
