// components/Navbar.tsx
import React from "react";
import AuthButton from "./AuthButton";

export default function Navbar(): JSX.Element {
  return (
    <nav className="p-4 flex justify-between items-center border-b">
      <div>
        <a href="/" className="text-xl font-bold">PhishBlock</a>
      </div>
      <div>
        <AuthButton />
      </div>
    </nav>
  );
}
