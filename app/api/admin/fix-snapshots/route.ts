import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";
import License from "@/models/License";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();
        
        // Find every unique workspace in your database
        const workspaces = await License.distinct("workspaceId");

        // Force the newly updated snapshot engine to run for every workspace
        for (const workspaceId of workspaces) {
            if (workspaceId) {
                await syncCurrentMonthSnapshot(workspaceId);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Snapshot collection successfully repaired and updated with Total Purchased Licenses!" 
        });
    } catch (error: any) {
        console.error("Snapshot Repair Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
