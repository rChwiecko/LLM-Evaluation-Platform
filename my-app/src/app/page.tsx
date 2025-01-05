"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import CreateExperiment from "./createExper";
import RunExperiment from "./runExper";

/** Our main Experiment interface */
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
    result?: {
      model_res: string;
      response_time: number;
      pass_fail: string;
      metrics?: {
        exactMatch?: boolean;
        pass_fail?: string;
        partialScore?: number;
        distance?: number;
        similarity?: number;
        reason?: string;
      };
    };
  }[];
}

export default function Home() {
  const [inExperimentCreation, setInExperimentCreation] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currExperiment, setCurrExperiment] = useState<Experiment | null>(null);

  /**
   * Called when user creates a brand-new experiment in <CreateExperiment />
   */
  function handleExperimentCreate(newExperiment: Experiment) {
    // Assign random ID
    newExperiment.id = Math.random().toString(36).substr(2, 9);

    // Add to list
    setExperiments((prev) => [...prev, newExperiment]);

    // Make it the current experiment
    setCurrExperiment(newExperiment);
    setInExperimentCreation(false);
  }

  /**
   * Called by <RunExperiment /> whenever a test run updates an experiment
   * (new test result, new test case added, etc.)
   */
  function handleUpdateExperiment(updatedExperiment: Experiment) {
    // Replace old experiment with the updated one
    setExperiments((prev) =>
      prev.map((exp) => (exp.id === updatedExperiment.id ? updatedExperiment : exp))
    );
    // Keep track as the current experiment
    setCurrExperiment(updatedExperiment);
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* --- SIDEBAR --- */}
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
                  {/* Experiment Name */}
                  <div className="font-bold">{experiment.name}</div>

                  {/* Show pass/fail for each test case as an example */}
                  <div className="text-xs">
                    {experiment.testCases.map((tc) => {
                      if (tc.result?.metrics?.pass_fail) {
                        return `(${tc.result.metrics.pass_fail}) `;
                      }
                      return "(NR) ";
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded px-4 py-2 text-sm text-gray-800">
                No experiments yet.
              </p>
            )}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">{/* Footer content here */}</SidebarFooter>
      </Sidebar>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col w-full">
        {/* TOP BAR */}
        <div className="flex items-center px-4 py-3 bg-white shadow-sm">
          <SidebarTrigger className="px-4 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 rounded" />
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex items-center justify-center p-8">
          {inExperimentCreation ? (
            // Show the CREATE form
            <div className="h-full w-full bg-white shadow-lg rounded p-6">
              <CreateExperiment onCreate={handleExperimentCreate} />
            </div>
          ) : (
            // Show RUN experiment content
            <div className="h-full w-full bg-white shadow-lg rounded p-6">
              <RunExperiment
                experiment={currExperiment}
                onUpdateExperiment={handleUpdateExperiment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
