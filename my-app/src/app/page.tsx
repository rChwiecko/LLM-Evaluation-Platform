"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import CreateExperiment from "./createExper";
import RunExperiment from "./runExper";
import Link from "next/link";

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
  const [currExperiment, setCurrExperiment] = useState<Experiment | null>(null);

  // Callback for <CreateExperiment />
  function handleExperimentCreate(newExperiment: Experiment) {
    setExperiments((prev) => [...prev, newExperiment]);
    setCurrExperiment(newExperiment);
    setInExperimentCreation(false);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* --- Sidebar --- */}
      <Sidebar className="w-64 border-r bg-gray-400 shadow-lg">
        <SidebarHeader className="px-4 py-3 text-lg font-semibold border-b border-gray-100">
          Experiments
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarGroup className="space-y-2">
            <button
              onClick={() => {
                setInExperimentCreation(true);
                setCurrExperiment(null);
              }}
              className="block w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Experiment
            </button>

            {experiments.length > 0 ? (
              experiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="block rounded px-4 py-2 text-sm hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setInExperimentCreation(false);
                    setCurrExperiment(experiment);
                  }}
                >
                  {experiment.name}
                </div>
              ))
            ) : (
              <p className="rounded px-4 py-2 text-sm text-gray-800">
                No experiments.
              </p>
            )}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">{/* Footer content */}</SidebarFooter>
      </Sidebar>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col w-full">
        {/* TOP BAR */}
        <div className="flex items-center px-4 py-3 bg-white shadow-sm">
          <SidebarTrigger className="px-4 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 rounded" />
        </div>

        {/* MAIN AREA: center the content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {inExperimentCreation ? (
            /* Show the create form */
            <div className="h-full w-full bg-white shadow-lg rounded p-6">
              <CreateExperiment onCreate={handleExperimentCreate} />
            </div>
          ) : (
            /* Show the "run experiment" content, or something else */
            <div className="h-full w-full bg-white shadow-lg rounded p-6">
              <RunExperiment experiment={currExperiment} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
