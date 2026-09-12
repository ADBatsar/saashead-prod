import { connectDB } from "@/lib/mongodb";
import Workspace from "@/models/Workspace";
import User from "@/models/User";
import License from "@/models/License";
import Vendor from "@/models/Vendor"; 
import AdminPageClient from "./AdminPageClient"; 

export const dynamic = "force-dynamic";
export const revalidate = 0; 

export default async function AdminPage() {
  await connectDB();

  let allVendors = [];
  try {
    allVendors = await Vendor.find({}).lean();
  } catch (error) {
    console.warn("Vendor collection not yet initialized.");
  }

  const [
    companiesCount,
    usersCount,
    activePlansCount,
    spendData,
    adminUsers,
    rawWorkspaces,
    allUsers,
    rawLicenses
  ] = await Promise.all([
    Workspace.countDocuments(),
    User.countDocuments(),
    License.countDocuments({ status: "active" }),
    License.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, totalSpend: { $sum: { $multiply: ["$costPerLicense", "$licenseCount"] } } } }
    ]),
    User.find({ role: { $in: ["Platform Owner", "Platform Admin"] } }).lean(),
    Workspace.find({}).lean(), 
    User.find({}).lean(),
    License.find({}).lean() 
  ]);

  const rawSpend = spendData[0]?.totalSpend || 0;
  const formattedSpend = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(rawSpend);

  // FIX 1: Map the Companies/Workspaces to extract the name from the User collection
  const processedCompanies = rawWorkspaces.map((workspace: any) => {
    // Find a user that belongs to this workspace to extract the company name
    const matchingUser = allUsers.find((u: any) => u.workspaceId?.toString() === workspace._id.toString() && u.companyName);
    
    return {
      _id: workspace._id.toString(),
      companyName: matchingUser ? matchingUser.companyName : "Unknown Company",
      domain: workspace.domain || "N/A",
      companySize: matchingUser ? matchingUser.companySize : "N/A"
    };
  });

  // FIX 2: Map licenses to extract Company Name from the User collection via workspaceId
  const processedLicenses = rawLicenses.map((lic: any) => {
    // Find a user that belongs to the same workspace as this license
    const matchingUser = allUsers.find((u: any) => u.workspaceId?.toString() === lic.workspaceId?.toString() && u.companyName);
    
    return {
      _id: lic._id.toString(),
      applicationName: lic.applicationName || "Unnamed App",
      companyName: matchingUser ? matchingUser.companyName : "Unknown Company", // NOW EXTRACTED FROM USER
      workspaceId: lic.workspaceId ? lic.workspaceId.toString() : "N/A",
      vendorName: lic.vendorName || "Unknown Vendor",
      vendorId: lic.vendorId ? lic.vendorId.toString() : null,
      category: lic.category || "N/A",
      department: lic.department || "N/A",
      owner: lic.owner || "N/A",
      billingCycle: lic.billingCycle || "N/A",
      status: lic.status || "N/A",
      licenseCount: lic.licenseCount || 0,
      costPerLicense: lic.costPerLicense || 0,
      assignedUsers: lic.assignedUsers || 0,
      createdAt: lic.createdAt,
      renewalDate: lic.renewalDate,
    };
  });

  const serializedData = {
    companiesCount,
    usersCount,
    activePlansCount,
    formattedSpend,
    adminUsers: JSON.parse(JSON.stringify(adminUsers)),
    allCompanies: processedCompanies, // Passing fixed companies
    allUsers: JSON.parse(JSON.stringify(allUsers)),
    allLicenses: processedLicenses,   // Passing fixed licenses
    allVendors: JSON.parse(JSON.stringify(allVendors)), 
  };

  return <AdminPageClient initialData={serializedData} />;
}
