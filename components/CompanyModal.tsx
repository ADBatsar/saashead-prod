"use client";

import { useState } from "react";

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (company: {
    companyName: string;
    companyCode: string;
    domain: string;
    country: string;
    adminEmail: string;
    plan: string;
  }) => void;
}

export default function CompanyModal({
  open,
  onClose,
  onSave,
}: CompanyModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [plan, setPlan] = useState("Trial");

  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/70
      flex
      items-center
      justify-center
      z-50
      "
    >
      <div
        className="
        glass
        w-full
        max-w-2xl
        rounded-2xl
        p-8
        "
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Add Company
          </h2>

          <button
            onClick={onClose}
            className="text-red-400 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2">
              Company Name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Company Code
            </label>

            <input
              type="text"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Domain
            </label>

            <input
              type="text"
              placeholder="company.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Country
            </label>

            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Company Admin Email
            </label>

            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Plan
            </label>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="
              w-full
              p-3
              rounded-xl
              bg-transparent
              border
              border-white/10
              "
            >
              <option>Trial</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="
            px-6
            py-3
            rounded-xl
            border
            border-white/10
            "
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSave({
                companyName,
                companyCode,
                domain,
                country,
                adminEmail,
                plan,
              });

              onClose();
            }}
            className="
            px-6
            py-3
            rounded-xl
            bg-gradient-to-r
            from-purple-600
            to-indigo-600
            "
          >
            Save Company
          </button>

        </div>
      </div>
    </div>
  );
}
