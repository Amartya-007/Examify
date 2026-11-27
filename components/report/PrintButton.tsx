"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download /> Export PDF
    </Button>
  );
}
