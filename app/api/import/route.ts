import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Workspace from "@/models/Workspace";
import User from "@/models/User";
import License from "@/models/License";
import Vendor from "@/models/Vendor";
import Project from "@/models/Project";
import Snapshot from "@/models/Snapshot";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();

    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ message: "No Workspace assigned" }, { status: 403 });
    }

    // --- STRICT RBAC: ONLY CHIEFS CAN IMPORT ---
    if (user.role !== "Workspace Chief" && user.role !== "Chief") {
        return NextResponse.json({ message: "Access Denied: Only the Workspace Chief can import data." }, { status: 403 });
    }

    const workspaceId = user.workspaceId;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) return NextResponse.json({ message: "No backup file uploaded" }, { status: 400 });

    const fileContents = await file.text();
    const backupData = JSON.parse(fileContents);

    if (!backupData?.data?.workspace) {
      return NextResponse.json({ message: "Invalid backup file format" }, { status: 400 });
    }

    if (backupData.data.workspace._id.toString() !== workspaceId.toString()) {
        return NextResponse.json({ message: "Backup file belongs to a different workspace" }, { status: 403 });
    }

    const { licenses, vendors, projects, snapshots } = backupData.data;

    // Wipe and Replace
    await Promise.all([
      License.deleteMany({ workspaceId }),
      Vendor.deleteMany({ workspaceId }),
      Project.deleteMany({ workspaceId }),
      Snapshot.deleteMany({ workspaceId })
    ]);

    await Promise.all([
      licenses?.length ? License.insertMany(licenses) : Promise.resolve(),
      vendors?.length ? Vendor.insertMany(vendors) : Promise.resolve(),
      projects?.length ? Project.insertMany(projects) : Promise.resolve(),
      snapshots?.length ? Snapshot.insertMany(snapshots) : Promise.resolve(),
      Workspace.findByIdAndUpdate(workspaceId, { 
        $set: { settings: backupData.data.workspace.settings } 
      })
    ]);

    return NextResponse.json({ success: true, message: "Workspace restored successfully" });

  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json({ message: "Internal Server Error during import" }, { status: 500 });
  }
}
