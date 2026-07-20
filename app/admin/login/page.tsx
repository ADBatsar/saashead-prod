"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    if (
      email === "admin@saashead.com" &&
      password === "admin123"
    ) {
      localStorage.setItem(
        "superadmin",
        "true"
      );

      router.push("/admin");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#0b0c17]
      "
    >
      <div
        className="
        glass
        rounded-3xl
        p-10
        w-full
        max-w-md
        "
      >

        <div className="text-center mb-10">

          <div
            className="
            w-20
            h-20
            mx-auto
            rounded-3xl
            bg-gradient-to-br
            from-purple-500
            to-indigo-600
            flex
            items-center
            justify-center
            text-4xl
            font-bold
            shadow-lg
            shadow-purple-500/40
            "
          >
            S
          </div>

          <h1
            className="
            text-4xl
            font-bold
            mt-6
            "
          >
            HeadSaaS
          </h1>

          <p className="text-gray-400 mt-2">
            Super Administrator
          </p>

        </div>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
            w-full
            p-4
            rounded-xl
            border
            border-white/10
            bg-transparent
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
            w-full
            p-4
            rounded-xl
            border
            border-white/10
            bg-transparent
            "
          />

          <button
            onClick={login}
            className="
            w-full
            p-4
            rounded-xl
            bg-gradient-to-r
            from-purple-600
            to-indigo-600
            hover:opacity-90
            font-semibold
            "
          >
            Login
          </button>

        </div>

        <div
          className="
          mt-8
          text-center
          text-sm
          text-gray-500
          "
        >
          HeadSaaS Platform Administration
        </div>

      </div>
    </div>
  );
}
