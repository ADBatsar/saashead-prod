import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb"; 
import Workspace from "@/models/Workspace";
import User from "@/models/User";
import License from "@/models/License";
import Vendor from "@/models/Vendor";
import Project from "@/models/Project";
import Snapshot from "@/models/Snapshot";

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();

    // 2. Fetch User & Verify Workspace
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ message: "No Workspace assigned" }, { status: 403 });
    }

    // 3. STRICT RBAC: ONLY CHIEFS CAN EXPORT
    if (user.role !== "Workspace Chief" && user.role !== "Chief") {
        return NextResponse.json({ message: "Access Denied: Only the Workspace Chief can export data." }, { status: 403 });
    }

    const workspaceId = user.workspaceId;

    // 4. Fetch All Data Concurrently (Catching errors if Workspace doesn't exist)
    const [
      workspace,
      users,
      licenses,
      vendors,
      projects,
      snapshots
    ] = await Promise.all([
      Workspace.findById(workspaceId).lean().catch(() => null), // Safely catch if ID format is strictly not found
      User.find({ workspaceId }).lean(),
      License.find({ workspaceId }).lean(),
      Vendor.find({ workspaceId }).lean(),
      Project.find({ workspaceId }).lean(),
      Snapshot.find({ workspaceId }).lean(),
    ]);

    // REMOVED THE 404 CRASH BLOCK HERE. 
    // If the workspace document is missing, we gracefully fall back to the raw ID.
    const safeWorkspaceCode = workspace?.workspaceCode || workspaceId.toString();

    // 5. Structure Payload
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        workspaceCode: safeWorkspaceCode,
      },
      data: { 
        workspace: workspace || { _id: workspaceId }, // Fallback stub so import doesn't break later
        users, 
        licenses, 
        vendors, 
        projects, 
        snapshots 
      }
    };

    // 6. Trigger Download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="saashead-backup-${safeWorkspaceCode}.json"`,
      },
    });

  } catch (error) {
    console.error("Export generation failed:", error);
    return NextResponse.json({ message: "Internal Server Error during export" }, { status: 500 });
  }
}
