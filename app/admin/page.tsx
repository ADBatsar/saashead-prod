import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";
import License from "@/models/License";
import AdminPageClient from "./AdminPageClient"; 

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Connect to database
  await connectDB();

  // Fetch all core platform data simultaneously for the modals
  const [
    companiesCount,
    usersCount,
    activePlansCount,
    spendData,
    adminUsers,
    allCompanies,
    allUsers,
    allLicenses
  ] = await Promise.all([
    Company.countDocuments(),
    User.countDocuments(),
    License.countDocuments({ status: "active" }),
    License.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, totalSpend: { $sum: { $multiply: ["$costPerLicense", "$licenseCount"] } } } }
    ]),
    User.find({ role: { $in: ["Platform Owner", "Platform Admin"] } }).lean(),
    Company.find({}).lean(),
    User.find({}).lean(),
    License.find({}).lean()
  ]);

  const rawSpend = spendData[0]?.totalSpend || 0;
  const formattedSpend = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(rawSpend);

  // Serialize MongoDB ObjectIds to strings so the browser can read them
  const serializedData = {
    companiesCount,
    usersCount,
    activePlansCount,
    formattedSpend,
    adminUsers: JSON.parse(JSON.stringify(adminUsers)),
    allCompanies: JSON.parse(JSON.stringify(allCompanies)),
    allUsers: JSON.parse(JSON.stringify(allUsers)),
    allLicenses: JSON.parse(JSON.stringify(allLicenses)), 
  };

  return <AdminPageClient initialData={serializedData} />;
}
