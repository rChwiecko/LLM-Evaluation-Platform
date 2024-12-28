"use client"
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

interface Experiment {
  id: string;
  name: string;
  description: string;
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
  const [inExperimentCreation, setInExperimentCreation] = useState(false); // State for experiment creation
  let experiments: Experiment[] | null = null; // Experiments can be null initially

  return (
    <div className="flex">
      <Sidebar>
        <SidebarHeader>Experiments</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {experiments ? (
              experiments.map((experiment) => (
                <Link
                  key={experiment.id}
                  href={`/experiments/${experiment.id}`}
                  className="block px-4 py-2 text-sm hover:bg-gray-200"
                >
                  {experiment.name}
                </Link>
              ))
            ) : (
              <p className="px-4 py-2 text-sm text-gray-500">
                No experiments available.
              </p>
            )}
          </SidebarGroup>
          <button
            onClick={() => setInExperimentCreation(true)}
            className="mt-4 block w-full px-4 py-2 text-sm font-medium"
          >
            Create Experiment
          </button>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarTrigger />
      {inExperimentCreation && (
        <div>creating experiement</div>
      )}
      {!inExperimentCreation && (
        <div>Not yet</div>
      )}
    </div>
  );
}
