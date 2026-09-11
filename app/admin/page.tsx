import { Building2, Users, CreditCard, Activity, ShieldAlert, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import Company from "@/models/Company"; 
import User from "@/models/User";
import License from "@/models/License";
import { connectDB } from "@/lib/mongodb"; 

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await connectDB();

  const [
    companiesCount, 
    usersCount, 
    activePlansCount, 
    spendData
  ] = await Promise.all([
    Company.countDocuments(),
    User.countDocuments(),
    License.countDocuments({ status: "active" }),
    License.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, totalSpend: { $sum: { $multiply: ["$costPerLicense", "$licenseCount"] } } } }
    ])
  ]);

  const rawSpend = spendData[0]?.totalSpend || 0;
  const formattedSpend = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(rawSpend);

  return (
    <div className="flex min-h-screen bg-[#FFFBEF] relative overflow-hidden">
      
      <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/15 blur-[120px] rounded-full pointer-events-none" />

      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-200/60 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[10px] uppercase font-bold tracking-widest text-violet-700 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                Live Platform Data
              </div>
              <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                HeadSaaS Control Center
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Welcome back, Super Admin. Here is your global platform overview.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Added Access Management Navigation Link */}
              <Link 
                href="/admin/access"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-amber-50 font-bold text-sm hover:bg-black transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Manage Access
              </Link>

              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-700 font-bold text-sm hover:bg-amber-50 hover:text-amber-700 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export Global Report
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Companies" value={companiesCount} icon={Building2} color="text-violet-600" bg="bg-violet-100" />
            <MetricCard title="Platform Users" value={usersCount} icon={Users} color="text-blue-600" bg="bg-blue-100" />
            <MetricCard title="Managed Applications" value={activePlansCount} icon={Activity} color="text-amber-600" bg="bg-amber-100" />
            <MetricCard title="Managed SaaS Spend" value={formattedSpend} icon={CreditCard} color="text-emerald-600" bg="bg-emerald-100" highlight={true} />
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-xl border border-amber-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-200/60 bg-white/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Recent Security & Activity Logs
              </h2>
            </div>
            <div className="p-16 flex flex-col items-center justify-center min-h-[300px] text-center">
               <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Activity className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-1">No Recent Activity</h3>
               <p className="text-slate-500 font-medium text-sm max-w-sm">
                 System logs, new organization signups, and platform alerts will populate here in real-time.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, highlight = false }: any) {
  return (
    <div className={`relative group overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1 ${
      highlight 
        ? 'bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200 shadow-md hover:shadow-lg' 
        : 'bg-white/80 backdrop-blur-md border border-amber-200/60 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {highlight && (
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
            Platform Wide
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-[11px] font-bold tracking-widest uppercase mb-1.5">{title}</h3>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
