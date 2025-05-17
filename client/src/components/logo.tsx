import React from "react";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`text-2xl font-bold text-primary ${className || ''}`}>
      FormCraft
    </Link>
  );
}
