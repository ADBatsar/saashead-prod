import Snapshot from "@/models/Snapshot";
import License from "@/models/License";

export async function syncCurrentMonthSnapshot(workspaceId: any) {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'short' }); // "Jul"
    const year = date.getFullYear().toString();

    const licenses = await License.find({ workspaceId }).lean();
    
    let totalPurchased = 0;
    let totalAssigned = 0;
    let totalSpend = 0;
    const applications: any[] = []; // 1. We must create an array to hold the apps

    licenses.forEach((lic: any) => {
        const seats = Number(lic.licenseCount) || 1; 
        const assigned = lic.assignedTo?.length || lic.assignedUsers || 0;
        
        const cost = Number(lic.costPerLicense) || 0;
        const monthlyCost = lic.billingCycle === 'yearly' ? (cost / 12) : cost;
        const totalMonthlyCost = seats * monthlyCost;
        
        totalPurchased += seats;
        totalAssigned += assigned;
        totalSpend += totalMonthlyCost; 

        // 2. Build the application data for the snapshot
        applications.push({
            licenseId: lic._id,
            applicationName: lic.applicationName,
            department: lic.department,
            costPerLicense: cost,
            assignedUsers: assigned,
            licenseCount: seats,
            monthlyCost: totalMonthlyCost
        });
    });

    await Snapshot.findOneAndUpdate(
        { workspaceId, month, year },
        {
            $set: {
                totalApplications: licenses.length,
                totalPurchasedLicenses: totalPurchased, 
                totalActiveLicenses: totalAssigned,     
                totalMonthlySpend: totalSpend,
                applications: applications, // 3. Save the array to the database!
                updatedAt: new Date()
            }
        },
        { upsert: true, new: true }
    );
}
