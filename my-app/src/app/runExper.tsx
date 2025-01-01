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

// Props interface for the component
interface CreateExperimentProps {
  experiment: Experiment | null;
}

export default function RunExperiment({ experiment }: CreateExperimentProps) {
  // If there's no current experiment, show a fallback
  if (!experiment) {
    return <div>No experiments created yet.</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-md p-6 max-w-4xl mx-auto">
      {/* Header row: experiment title & a "Run" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Experiment: {experiment.name}</h1>
      </div>
      <div className="flex gap-6 mb-4">
        <p className="font-semibold">
          System Prompt: {experiment.systemPrompt}
        </p>
        <p className="font-semibold">Model: {experiment.model}</p>
      </div>

      {/* Test Cases */}
      <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
      {experiment.testCases.length === 0 ? (
        <p className="text-gray-700">No test cases added yet.</p>
      ) : (
        experiment.testCases.map((tc) => (
          <div key={tc.id} className="border rounded p-4 my-3">
            <p className="font-medium">User Message: {tc.userMessage}</p>
            <p>Expected Output: {tc.expectedOutput}</p>
            <p>Grader: {tc.grader}</p>
          </div>
        ))
      )}
    </div>
  );
}
