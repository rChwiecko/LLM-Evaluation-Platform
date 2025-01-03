import React, { useState } from "react";

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

interface CreateExperimentProps {
  experiment: Experiment | null;
}

export default function RunExperiment({ experiment }: CreateExperimentProps) {
  const [localExperiment, setLocalExperiment] = useState<Experiment | null>(
    experiment
  );

  const [newTestCase, setNewTestCase] = useState({
    userMessage: "",
    expectedOutput: "",
    grader: "exact" as "exact" | "partial" | "llm_match",
  });

  const [showTestCaseForm, setShowTestCaseForm] = useState(false);

  // Error state for test case fields
  const [testCaseErrors, setTestCaseErrors] = useState({
    userMessage: false,
    expectedOutput: false,
  });

  if (!localExperiment) {
    return <div>No experiments created yet.</div>;
  }

  function handleNewTestCaseChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setNewTestCase((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    setTestCaseErrors((prev) => ({ ...prev, [name]: false }));
  }

  function handleShowTestCaseForm() {
    setShowTestCaseForm(true);
  }

  function handleAddTestCase() {
    const errors = {
      userMessage: !newTestCase.userMessage.trim(),
      expectedOutput: !newTestCase.expectedOutput.trim(),
    };

    setTestCaseErrors(errors);

    // If there are any errors, don't proceed
    if (errors.userMessage || errors.expectedOutput) {
      return;
    }

    const updatedTestCases = [
      ...localExperiment!.testCases,
      {
        id: crypto.randomUUID(),
        ...newTestCase,
      },
    ];

    setLocalExperiment((prev) =>
      prev ? { ...prev, testCases: updatedTestCases } : prev
    );

    setNewTestCase({
      userMessage: "",
      expectedOutput: "",
      grader: "exact",
    });

    setShowTestCaseForm(false);
  }

  function handleCloseTestCaseForm() {
    setShowTestCaseForm(false);
    newTestCase.userMessage = "";
    newTestCase.expectedOutput = "";
  }

  function handleRemoveTestCase(index: number): void {
    if (!localExperiment) return;

    const updatedTestCases = localExperiment.testCases.filter(
      (_, i) => i !== index
    );
    setLocalExperiment((prev) =>
      prev ? { ...prev, testCases: updatedTestCases } : prev
    );
  }

  function handleRunTestCase(
    testCase: Experiment["testCases"][0],
    experiment: Experiment
  ) {
    console.log("Running test case:", testCase);
    console.log(experiment.model);
    console.log(experiment.systemPrompt);
  }

  return (
    <div className="bg-white shadow-lg rounded-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Experiment: {localExperiment.name}
        </h1>
      </div>
      <div className="flex gap-6 mb-4 justify-between">
        <p className="font-semibold">
          System Prompt: {localExperiment.systemPrompt}
        </p>
        <p className="font-semibold">Model: {localExperiment.model}</p>
      </div>

      <div className="mt-6 border-t pt-4">
        {!showTestCaseForm && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleShowTestCaseForm}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add Test Case
            </button>
          </div>
        )}

        {showTestCaseForm && (
          <div className="bg-gray-50 border rounded-md p-4">
            <div className="flex gap-4 items-center mb-4">
              <div className="flex-1">
                <label
                  htmlFor="userMessage"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Message
                </label>
                <input
                  type="text"
                  id="userMessage"
                  name="userMessage"
                  value={newTestCase.userMessage}
                  onChange={handleNewTestCaseChange}
                  className={`mt-1 block w-full rounded border ${
                    testCaseErrors.userMessage
                      ? "border-red-600 focus:border-red-600 focus:ring-red-600"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {testCaseErrors.userMessage && (
                  <p className="text-red-600 text-sm mt-1">
                    User Message is required.
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="expectedOutput"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expected Output
                </label>
                <input
                  type="text"
                  id="expectedOutput"
                  name="expectedOutput"
                  value={newTestCase.expectedOutput}
                  onChange={handleNewTestCaseChange}
                  className={`mt-1 block w-full rounded border ${
                    testCaseErrors.expectedOutput
                      ? "border-red-600 focus:border-red-600 focus:ring-red-600"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {testCaseErrors.expectedOutput && (
                  <p className="text-red-600 text-sm mt-1">
                    Expected Output is required.
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="grader"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grader
                </label>
                <select
                  id="grader"
                  name="grader"
                  value={newTestCase.grader}
                  onChange={handleNewTestCaseChange}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="exact">Exact</option>
                  <option value="partial">Partial</option>
                  <option value="llm_match">LLM Match</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleCloseTestCaseForm()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded h-10 self-end"
              >
                Remove
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddTestCase}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Add Test Case
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
      {localExperiment.testCases.length === 0 ? (
        <p className="text-gray-700">No test cases added yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Input
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Expected
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Grader
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {localExperiment.testCases.map((tc, index) => (
              <tr key={tc.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  Test Case {index + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {tc.userMessage}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {tc.expectedOutput}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {tc.grader}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveTestCase(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleRunTestCase(tc, localExperiment)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Run
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
