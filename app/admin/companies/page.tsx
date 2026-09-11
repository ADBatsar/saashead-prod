"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import CompanyModal from "@/components/CompanyModal";

interface Company {
  _id?: string;
  companyName: string;
  companyCode: string;
  domain: string;
  country: string;
  adminEmail: string;
  plan: string;
  status: string;
}

export default function CompaniesPage() {

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");

      if (!response.ok) {
        throw new Error("Failed to load companies");
      }

      const data = await response.json();

      setCompanies(data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCompany = async (company: any) => {
    try {

      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      await loadCompanies();

      setShowModal(false);

      alert("Company created successfully.");

    } catch (error) {

      console.error(error);

      alert("Failed to create company.");

    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);
return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold">
              Companies
            </h1>

            <p className="text-gray-400 mt-2">
              Manage all organizations using SaaSHead.
            </p>
          </div>

	<button
  onClick={() => setShowModal(true)}
  className="
    bg-gradient-to-r
    from-purple-600
    to-indigo-600
    px-6
    py-3
    rounded-xl
    font-semibold
    hover:opacity-90
    transition
  "
>
  + Add Company
</button>

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="glass rounded-2xl p-6">
            <p className="text-gray-400">
              Total Companies
            </p>

            <h2 className="text-4xl font-bold mt-3">
              24
            </h2>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-gray-400">
              Active
            </p>

            <h2 className="text-4xl font-bold mt-3">
              21
            </h2>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-gray-400">
              Trial
            </p>

            <h2 className="text-4xl font-bold mt-3">
              2
            </h2>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-gray-400">
              Suspended
            </p>

            <h2 className="text-4xl font-bold mt-3">
              1
            </h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass rounded-2xl p-6 mb-10">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search companies..."
              className="
                w-96
                p-3
                rounded-xl
                bg-transparent
                border
                border-white/10
                outline-none
              "
            />

            <div className="flex gap-4">
              <select
                className="
                  bg-transparent
                  border
                  border-white/10
                  rounded-xl
                  px-4
                  py-3
                "
              >
                <option>All Plans</option>
                <option>Trial</option>
                <option>Business</option>
                <option>Enterprise</option>
              </select>

              <select
                className="
                  bg-transparent
                  border
                  border-white/10
                  rounded-xl
                  px-4
                  py-3
                "
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Trial</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>
	<div className="glass rounded-2xl overflow-hidden">
  <table className="w-full">
    <thead className="bg-white/5">
      <tr>
        <th className="text-left px-6 py-4">Code</th>
        <th className="text-left px-6 py-4">Company</th>
        <th className="text-left px-6 py-4">Country</th>
        <th className="text-left px-6 py-4">Plan</th>
        <th className="text-left px-6 py-4">Company Admin</th>
        <th className="text-left px-6 py-4">Status</th>
        <th className="text-center px-6 py-4">Actions</th>
      </tr>
    </thead>

    <tbody>
      {companies.map((company) => (
        <tr
          key={company.companyCode}
          className="border-t border-white/10 hover:bg-white/5 transition"
        >
          <td className="px-6 py-4 font-mono">
            {company.companyCode}
          </td>

          <td className="px-6 py-4 font-semibold">
            {company.companyName}
          </td>

          <td className="px-6 py-4">
            {company.country}
          </td>

          <td className="px-6 py-4">
            {company.plan}
          </td>

          <td className="px-6 py-4 text-gray-300">
            {company.adminEmail}
          </td>

          <td className="px-6 py-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                company.status === "Active"
                  ? "bg-green-600"
                  : company.status === "Trial"
                  ? "bg-yellow-500"
                  : "bg-red-600"
              }`}
            >
              {company.status}
            </span>
          </td>

          <td className="px-6 py-4">
            <div className="flex justify-center gap-2">
              <button
                className="
                px-3
                py-1
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                transition
                "
              >
                Edit
              </button>

              <button
                className="
                px-3
                py-1
                rounded-lg
                bg-red-600
                hover:bg-red-700
                transition
                "
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<CompanyModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onSave={handleCreateCompany}
/>
      </main>
    </div>
  );
}

