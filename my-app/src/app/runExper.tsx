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

  const [testResults, setTestResults] = useState<
    Record<
      string,
      {
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
      } | null
    >
  >({});

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

  async function handleRunTestCase(
    testCase: Experiment["testCases"][0],
    experiment: Experiment
  ) {
    const payload = {
      model: experiment.model,
      prompt: testCase.userMessage,
      responseExpected: testCase.expectedOutput,
      messages: [
        {
          role: "system",
          content: experiment.systemPrompt,
          name: "system",
        },
        {
          role: "user",
          content: testCase.userMessage,
          name: "user",
        },
      ],
    };
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update testResults state with the result
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: result,
      }));
    } catch (error: any) {
      console.error("Error running test case:", error);
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-md p-6 w-11/12 mx-auto">
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

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Test Cases</h2>

        {localExperiment.testCases.length === 0 ? (
          <p className="text-gray-700">No test cases added yet.</p>
        ) : (
          // 1. Wrap table in an overflow container to avoid squishing
          <div className="">
            {/* 2. Switch to table-auto so columns size more flexibly */}
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Name
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
                  {/* New Metrics column */}
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
                    Response Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Pass/Fail
                  </th>
                </tr>
              </thead>
              <tbody>
                {localExperiment.testCases.map((tc, index) => {
                  // Optionally, define a helper function or inline logic to format metrics
                  const graderType = tc.grader; // e.g. "exact", "partial", or "llm"
                  const metrics = testResults[tc.id]?.metrics;

                  // Here’s a sample approach with inline logic
                  let metricsDisplay = "No Metrics";
                  if (metrics) {
                    switch (graderType) {
                      case "exact":
                        metricsDisplay = `Exact Match: ${
                          metrics?.exactMatch ? "Yes" : "No"
                        }`;
                        break;
                      case "partial":
                        metricsDisplay = `Partial Score: ${(
                          metrics?.partialScore ?? 0
                        ).toFixed(0)}%\nDistance: ${
                          metrics?.distance ?? "N/A"
                        }`;
                        break;
                      case "llm_match":
                        metricsDisplay = `Similarity: ${
                          metrics?.similarity || "N/A"
                        }\nReason: ${metrics?.reason || "N/A"}`;
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
                        {graderType}
                      </td>
                      {/* Our new Metrics cell. Note whitespace-pre-wrap for multiline */}
                      <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap break-words align-top">
                        {metricsDisplay}
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
                            onClick={() =>
                              handleRunTestCase(tc, localExperiment)
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Run
                          </button>
                        </div>
                      </td>
                      {/* 3. Use whitespace-pre-wrap and break-words so long text wraps nicely */}
                      <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap break-words align-top">
                        {testResults[tc.id]?.model_res || "Not Run"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {testResults[tc.id]?.response_time
                          ? `${testResults[tc.id]?.response_time}ms`
                          : "Not Run"}
                      </td>
                      <td
                        className={`border border-gray-300 px-4 py-2 ${
                          testResults[tc.id]?.metrics?.pass_fail === "pass"
                            ? "bg-green-100 text-green-800"
                            : testResults[tc.id]?.metrics?.pass_fail === "fail"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {testResults[tc.id]?.metrics?.pass_fail || "Not Run"}
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
