import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPage() {
  return (
    <div className="flex">

      <AdminSidebar />

      <main className="flex-1 p-10">

        <h1 className="text-5xl font-bold">
          HeadSaaS Control Center
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome back, Super Admin.
	</p>	  
	  <div className="grid grid-cols-4 gap-6 mt-10">

	  
  <div className="glass rounded-2xl p-6">
    <p className="text-gray-400">
      Companies
    </p>

    <h2 className="text-4xl font-bold mt-3">
      12
    </h2>
  </div>

  <div className="glass rounded-2xl p-6">
    <p className="text-gray-400">
      Users
    </p>

    <h2 className="text-4xl font-bold mt-3">
      284
    </h2>
  </div>

  <div className="glass rounded-2xl p-6">
    <p className="text-gray-400">
      Active Plans
    </p>

    <h2 className="text-4xl font-bold mt-3">
      11
    </h2>
  </div>

  <div className="glass rounded-2xl p-6">
    <p className="text-gray-400">
      Monthly Revenue
    </p>

    <h2 className="text-4xl font-bold mt-3">
      $18,400
    </h2>
  </div>

</div>	  
   

      </main>

    </div>
  );
}
