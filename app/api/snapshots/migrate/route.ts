import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import License from "@/models/License";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";

export async function GET(req: Request) {
    try {
        // NOTE: In production, wrap this in an Admin check or a secret CRON header check
        await connectDB();

        // Find all unique workspace IDs currently utilizing licenses
        const distinctWorkspaces = await License.distinct("workspaceId");

        let migratedCount = 0;

        for (const workspaceId of distinctWorkspaces) {
            await syncCurrentMonthSnapshot(workspaceId);
            migratedCount++;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Migration complete. Successfully generated initial snapshots for ${migratedCount} workspaces.` 
        });

    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
