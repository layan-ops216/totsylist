"use client";
import { useState } from "react";
import GenerateButton from "@/app/components/GenerateButton";
import TotsyListRenderer from "@/app/components/TotsyListRenderer";
import Sidebar from "@/app/components/Sidebar";
import type { TotsyListResponse } from "@/app/types/totsylist";

export default function Page() {
  const [data, setData] = useState<TotsyListResponse | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-semibold text-gray-900">TotsyList</h1>
              <p className="text-gray-600 mt-1">For all your kid / baby related product needs</p>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="max-w-4xl">
              <div className="mb-8">
                <GenerateButton onResult={(d) => setData(d)} />
              </div>
              
              <div>
                <TotsyListRenderer data={data} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
