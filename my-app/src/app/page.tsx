"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import CreateExperiment from "./createExper";

interface Experiment {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  testCases: {
    id: string;
    userMessage: string;
    expectedOutput: string;
    grader: "exact" | "partial" | "llm_match";
  }[];
}

export default function Home() {
  const [inExperimentCreation, setInExperimentCreation] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 border-r border-gray-200 bg-white">
        <SidebarHeader className="px-4 py-3 text-lg font-semibold border-b border-gray-100">
          Experiments
        </SidebarHeader>

        <SidebarContent className="p-4">
          <SidebarGroup className="space-y-2">
            <button
              onClick={() => setInExperimentCreation(true)}
              className="block w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Experiment
            </button>

            {experiments ? (
              experiments.map((experiment: Experiment) => (
                <Link
                  key={experiment.id}
                  href={`/experiments/${experiment.id}`}
                  className="block rounded px-4 py-2 text-sm hover:bg-gray-200"
                >
                  {experiment.name}
                </Link>
              ))
            ) : (
              <p className="rounded px-4 py-2 text-sm text-gray-500">
                No experiments available.
              </p>
            )}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          {/* Footer content if needed */}
        </SidebarFooter>
      </Sidebar>

      {/* Main Content (fills remaining space) */}
      <div className="flex-1 flex flex-col">
        {/* Sidebar toggle */}
        <div className="p-4">
          <SidebarTrigger className="p-4 text-sm font-medium" />
        </div>

        {/* Content area */}
        <div className="p-4 flex-1 text-center sticky">
          {inExperimentCreation ? (
            <div className="text-sm font-medium text-gray-800">
              <CreateExperiment />
            </div>
          ) : (
            <div className="text-sm font-medium text-gray-800">
              Not yet but this willl soon have content in it
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
