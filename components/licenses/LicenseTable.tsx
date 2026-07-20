"use client";

import VendorBadge from "@/components/workspace/VendorBadge";
import { HealthDot } from "@/components/workspace/StatusChip";
import {
    ArrowUpDown,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    currency,
    formatDate,
} from "@/lib/utils";

interface License {
    _id: string;
    applicationName: string;
    vendor: string;
    licenseCount: number;
    assignedUsers: number;
    costPerLicense: number;
    billingCycle: string;
    renewalDate: string;
}

interface Props {
    licenses: License[];
    sortField: string;
    sortDirection: string;
    sortBy: (field: string) => void;
    editLicense: (license: License) => void;
    deleteLicense: (license: License) => void;
}

function health(
    total: number,
    assigned: number
) {
    const unused = total - assigned;

    if (unused <= 0)
        return "healthy";

    if (
        unused <=
        Math.max(2, total * 0.15)
    )
        return "underutilized";

    return "waste";
}

const LABEL = {
    healthy: "Healthy",
    underutilized: "Underutilized",
    waste: "Waste",
};

export default function LicenseTable({
    licenses,
    sortBy,
    editLicense,
    deleteLicense,
}: Props) {

    return (

<div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden">

<div className="overflow-x-auto">

<table className="w-full">

<thead className="bg-[#111728]">

<tr className="text-[11px] uppercase tracking-wider text-slate-500">

{[
["applicationName","Application"],
["vendor","Vendor"],
["licenseCount","Seats"],
["assignedUsers","Assigned"],
["costPerLicense","Price"],
["renewalDate","Renewal"],
].map(([key,label])=>(

<th
key={key}
className="px-5 py-4 text-left"
>

<button
onClick={()=>sortBy(key)}
className="inline-flex items-center gap-1 hover:text-white transition"
>

{label}

<ArrowUpDown
className="w-3 h-3"
/>

</button>

</th>

))}

<th className="px-5 py-4">

Health

</th>

<th className="px-5 py-4 text-right">

Actions

</th>

</tr>

</thead>

<tbody>

{licenses.map((license)=>{

const unused =
Math.max(
0,
license.licenseCount-
license.assignedUsers
);

const h=
health(
license.licenseCount,
license.assignedUsers
);

return(

<tr
key={license._id}
className="border-t border-slate-800/50 hover:bg-white/[0.02]"
>

<td className="px-5 py-4">

<div className="flex items-center gap-3">

<VendorBadge
name={license.vendor}
size={30}
/>

<div>

<div className="text-white font-medium">

{license.applicationName}

</div>

<div className="text-xs text-slate-500">

{license.vendor}

</div>

</div>

</div>

</td>

<td className="px-5 py-4 text-slate-300">

{license.vendor}

</td>

<td className="px-5 py-4 text-white">

{license.licenseCount}

</td>

<td className="px-5 py-4">

<div>

<div className="text-white">

{license.assignedUsers}

</div>

<div className="text-xs text-rose-300">

{unused} unused

</div>

</div>

</td>

<td className="px-5 py-4 text-white">

{currency(
license.costPerLicense*
license.licenseCount
)}

</td>

<td className="px-5 py-4 text-slate-300">

{formatDate(
license.renewalDate
)}

</td>

<td className="px-5 py-4">

<div className="flex items-center gap-2">

<HealthDot
health={h}
/>

<span className="text-xs text-slate-300">

{LABEL[h]}

</span>

</div>

</td>

<td className="px-5 py-4">

<div className="flex justify-end gap-2">

<button
onClick={()=>
editLicense(
license
)
}
className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition"
>

<Pencil
className="w-4 h-4"
/>

</button>

<button
onClick={()=>
deleteLicense(
license
)
}
className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition"
>

<Trash2
className="w-4 h-4"
/>

</button>

</div>

</td>

</tr>

);

})}

{licenses.length===0&&(

<tr>

<td
colSpan={8}
className="py-12 text-center text-slate-500"
>

No licenses found.

</td>

</tr>

)}

</tbody>

</table>

</div>

</div>

    );

}
