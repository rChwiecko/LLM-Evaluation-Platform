import React, { useState } from "react";

// Same interface as in page.tsx
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

/**
 * Props:
 * - experiment: The currently selected experiment (from parent)
 * - onUpdateExperiment: A callback to let the parent update its state
 */
interface RunExperimentProps {
  experiment: Experiment | null;
  onUpdateExperiment?: (updatedExp: Experiment) => void;
}

export default function RunExperiment({
  experiment,
  onUpdateExperiment,
}: RunExperimentProps) {
  // Keep a local copy of the experiment for easy manipulation
  const [localExperiment, setLocalExperiment] = useState<Experiment | null>(
    experiment
  );

  // Fields for the "Add Test Case" form
  const [newTestCase, setNewTestCase] = useState({
    userMessage: "",
    expectedOutput: "",
    grader: "exact" as "exact" | "partial" | "llm_match",
  });

  // Show/hide form
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);

  // Track errors for userMessage & expectedOutput
  const [testCaseErrors, setTestCaseErrors] = useState({
    userMessage: false,
    expectedOutput: false,
  });

  if (!localExperiment) {
    return <div>No experiments created yet.</div>;
  }

  // ------ Handlers ------

  function handleNewTestCaseChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setNewTestCase((prev) => ({ ...prev, [name]: value }));

    // Clear error as soon as user starts typing
    setTestCaseErrors((prev) => ({ ...prev, [name]: false }));
  }

  function handleShowTestCaseForm() {
    setShowTestCaseForm(true);
  }

  function handleCloseTestCaseForm() {
    setShowTestCaseForm(false);
    setNewTestCase({
      userMessage: "",
      expectedOutput: "",
      grader: "exact",
    });
  }

  function handleAddTestCase() {
    // Validate
    const errors = {
      userMessage: !newTestCase.userMessage.trim(),
      expectedOutput: !newTestCase.expectedOutput.trim(),
    };
    setTestCaseErrors(errors);

    if (errors.userMessage || errors.expectedOutput) {
      return; // stop if invalid
    }

    // Add to local state
    const updatedTestCases = [
      ...(localExperiment?.testCases || []),
      {
        id: crypto.randomUUID(),
        ...newTestCase,
      },
    ];
    if (!localExperiment) return;

    const updatedExperiment: Experiment = {
      ...localExperiment,
      id: localExperiment.id || crypto.randomUUID(), // Ensure id is defined
      name: localExperiment.name || "Unnamed Experiment", // Ensure name is defined
      systemPrompt: localExperiment.systemPrompt || "", // Ensure systemPrompt is defined
      model: localExperiment.model || "defaultModel", // Ensure model is defined
      testCases: updatedTestCases,
    };

    // Update local
    setLocalExperiment(updatedExperiment);

    // Notify parent (optional, if you want real-time test case updates)
    onUpdateExperiment?.(updatedExperiment);

    // Reset form
    handleCloseTestCaseForm();
  }

  function handleRemoveTestCase(index: number) {
    if (!localExperiment) return;
    const updatedTestCases = localExperiment.testCases.filter(
      (_, i) => i !== index
    );
    const updatedExperiment = {
      ...localExperiment,
      testCases: updatedTestCases,
    };

    setLocalExperiment(updatedExperiment);

    // Also tell the parent, if needed
    onUpdateExperiment?.(updatedExperiment);
  }

  /**
   * This is called when user clicks "Run" on a test case
   */
  async function handleRunTestCase(
    testCase: Experiment["testCases"][0],
    experiment: Experiment
  ) {
    const payload = {
      model: experiment.model,
      prompt: testCase.userMessage,
      responseExpected: testCase.expectedOutput,
      messages: [
        { role: "system", content: experiment.systemPrompt, name: "system" },
        { role: "user", content: testCase.userMessage, name: "user" },
      ],
    };

    // Route depends on grader type
    let url = "";
    switch (testCase.grader) {
      case "exact":
        url = "/api/exact";
        break;
      case "partial":
        url = "/api/partial";
        break;
      case "llm_match":
        url = "/api/llm";
        break;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // The returned result presumably has { model_res, response_time, pass_fail, metrics... }
      const result = await response.json();

      // Update the local experiment with the new test result
      setLocalExperiment((prev) => {
        if (!prev) return null;

        const updatedTestCases = prev.testCases.map((tc) =>
          tc.id === testCase.id ? { ...tc, result } : tc
        );
        const updatedExperiment = { ...prev, testCases: updatedTestCases };

        // NOTE: This is the callback that triggers parent state update,
        // but it's called inside an event handler's async callback -> SAFE
        onUpdateExperiment?.(updatedExperiment);

        return updatedExperiment;
      });
    } catch (error) {
      console.error("Error running test case:", error);
    }
  }

  // ------ Render ------
  return (
    <div className="bg-white shadow-lg rounded-md p-6 w-11/12 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Experiment: {localExperiment.name}</h1>
      </div>

      <div className="flex gap-6 mb-4 justify-between">
        <p className="font-semibold">System Prompt: {localExperiment.systemPrompt}</p>
        <p className="font-semibold">Model: {localExperiment.model}</p>
      </div>

      {/* Add Test Case Form */}
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
              {/* USER MESSAGE */}
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

              {/* EXPECTED OUTPUT */}
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

              {/* GRADER */}
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

              {/* CANCEL */}
              <button
                type="button"
                onClick={handleCloseTestCaseForm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded h-10 self-end"
              >
                Remove
              </button>
            </div>

            {/* Submit */}
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

      {/* Test Cases Table */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Test Cases</h2>

        {localExperiment.testCases.length === 0 ? (
          <p className="text-gray-700">No test cases added yet.</p>
        ) : (
          <div>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    #
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Input
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Expected
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Grader
                  </th>

                  {/* METRICS COLUMN */}
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Metrics
                  </th>

                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Actions
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Response
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Pass/Fail
                  </th>
                </tr>
              </thead>
              <tbody>
                {localExperiment.testCases.map((tc, index) => {
                  // Optional: compute a user-friendly metrics display
                  const { metrics } = tc.result || {};
                  let metricsDisplay = "No Metrics";
                  if (metrics) {
                    switch (tc.grader) {
                      case "exact":
                        metricsDisplay = `Exact Match: ${
                          metrics.exactMatch ? "Yes" : "No"
                        }`;
                        break;
                      case "partial":
                        metricsDisplay = `Partial Score: ${
                          metrics.partialScore ?? 0
                        }%\nDistance: ${
                          metrics.distance ?? "N/A"
                        }`;
                        break;
                      case "llm_match":
                        metricsDisplay = `Similarity: ${
                          metrics.similarity ?? "N/A"
                        }\nReason: ${metrics.reason ?? "N/A"}`;
                        break;
                      default:
                        metricsDisplay = "No Metrics";
                        break;
                    }
                  }

                  return (
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

                      {/* METRICS CELL */}
                      <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap break-words align-top">
                        {metricsDisplay}
                      </td>

                      {/* Actions */}
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

                      {/* Response */}
                      <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap break-words align-top">
                        {tc.result?.model_res || "Not Run"}
                      </td>

                      {/* Time */}
                      <td className="border border-gray-300 px-4 py-2">
                        {tc.result?.response_time
                          ? `${tc.result.response_time} ms`
                          : "Not Run"}
                      </td>

                      {/* Pass/Fail */}
                      <td
                        className={`border border-gray-300 px-4 py-2 ${
                          tc.result?.metrics?.pass_fail === "pass"
                            ? "bg-green-100 text-green-800"
                            : tc.result?.metrics?.pass_fail === "fail"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {tc.result?.metrics?.pass_fail || "Not Run"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
