"use client";

import Layout from "@/components/workspace/Layout";

export default function PlatformAdminPortal() {
  return (
    <Layout title="Platform Owner Portal" subtitle="Global system oversight">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Stats */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-amber-500">
          <div className="text-amber-400 text-xs uppercase">Total Workspaces</div>
          <div className="text-white text-3xl font-bold mt-2">1,240</div>
        </div>
        
        <div className="col-span-2 bg-[#0E1320] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-white font-display mb-4">System Health & Licensing</h2>
          <p className="text-slate-400 text-sm">Monitor all client workspaces and platform-wide subscription health here.</p>
        </div>
      </div>
    </Layout>
  );
}
