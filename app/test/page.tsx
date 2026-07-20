"use client";

export default function TestPage() {
  return (
    <div style={{ padding: "50px" }}>
      <h1>Test Page</h1>

      <button
        onClick={() => {
          alert("WORKING");
          console.log("WORKING");
        }}
        style={{
          background: "red",
          color: "white",
          padding: "20px",
          cursor: "pointer",
        }}
      >
        CLICK ME
      </button>
    </div>
  );
}
