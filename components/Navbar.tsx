"use client";

import { useState } from "react";

export default function Navbar() {
  const [showLogin, setShowLogin] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {
    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        document.cookie =
          `token=${data.token}; path=/`;

        window.location.href =
          "/dashboard";
      } else {
        alert(
          data.message ||
            "Login failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="section-container flex justify-between items-center py-5">

          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="HeadSaaS"
              className="h-14 w-auto"
            />

            <div>
              <h1 className="font-bold text-xl">
                HeadSaaS
              </h1>

              <p className="text-xs text-gray-400">
                SaaS Management Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-8">
            <a href="#features">
              Features
            </a>

            <a href="#integrations">
              Integrations
            </a>

            <a href="#faq">
              FAQ
            </a>

            <a href="#contact">
              Contact
            </a>
          </div>

          <div className="flex gap-4">

            <button
              onClick={() =>
                setShowLogin(true)
              }
              className="
              border
              border-purple-600
              text-purple-400
              px-5
              py-3
              rounded-xl
              hover:bg-purple-600
              hover:text-white
              "
            >
              Login
            </button>

            <button
              className="
              bg-purple-600
              px-5
              py-3
              rounded-xl
              hover:bg-purple-700
              "
            >
              Book Demo
            </button>

          </div>

        </div>
      </nav>

      {showLogin && (
        <div
          className="
          fixed
          inset-0
          bg-black/70
          flex
          items-center
          justify-center
          z-[100]
          "
        >
          <div
            className="
            bg-gray-900
            p-8
            rounded-xl
            w-full
            max-w-md
            "
          >
            <h2 className="text-2xl mb-6">
              Login
            </h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
              w-full
              p-3
              rounded
              border
              mb-4
              bg-transparent
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
              w-full
              p-3
              rounded
              border
              mb-4
              bg-transparent
              "
            />

            <button
              onClick={handleLogin}
              className="
              w-full
              bg-purple-600
              py-3
              rounded
              "
            >
              Login
            </button>

            <button
              onClick={() =>
                setShowLogin(false)
              }
              className="
              mt-4
              text-gray-400
              w-full
              "
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}
