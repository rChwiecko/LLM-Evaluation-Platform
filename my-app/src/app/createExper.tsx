import React, { useState } from "react";
import { availableModels } from "./models";

interface TestCase {
  id: string;
  userMessage: string;
  expectedOutput: string;
  grader: "exact" | "partial" | "llm_match";
}

interface Experiment {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  testCases: TestCase[];
}

interface CreateExperimentProps {
  onCreate: (experiment: Experiment) => void;
}

const CreateExperiment: React.FC<CreateExperimentProps> = ({ onCreate }) => {
  const [experiment, setExperiment] = useState<Experiment>({
    id: "",
    name: "",
    systemPrompt: "",
    model: "",
    testCases: [],
  });

  const [errors, setErrors] = useState<{
    name: boolean;
    systemPrompt: boolean;
    model: boolean;
    testCases: {
      userMessage: boolean;
      expectedOutput: boolean;
      grader: boolean;
    }[];
  }>({
    name: false,
    systemPrompt: false,
    model: false,
    testCases: [],
  });

  function getInputClasses(hasError: boolean) {
    return hasError
      ? "mt-1 block w-full rounded border-red-600 shadow-sm focus:border-red-600 focus:ring-red-600"
      : "mt-1 block w-full rounded border-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400";
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setExperiment((prev) => ({ ...prev, [name]: value }));
  }

  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedModel = e.target.value;
    setExperiment((prev) => ({ ...prev, model: selectedModel }));
  }

  function handleAddTestCase() {
    setExperiment((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        {
          id: crypto.randomUUID(),
          userMessage: "",
          expectedOutput: "",
          grader: "exact",
        },
      ],
    }));
    setErrors((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { userMessage: false, expectedOutput: false, grader: false },
      ],
    }));
  }

  function handleTestCaseFieldChange(
    index: number,
    field: keyof TestCase,
    value: string
  ) {
    setExperiment((prev) => {
      const updatedTestCases = [...prev.testCases];
      updatedTestCases[index] = {
        ...updatedTestCases[index],
        [field]: value,
      };
      return { ...prev, testCases: updatedTestCases };
    });
  }

  function handleRemoveTestCase(index: number) {
    setExperiment((prev) => {
      const updatedTestCases = [...prev.testCases];
      updatedTestCases.splice(index, 1);
      return { ...prev, testCases: updatedTestCases };
    });
    setErrors((prev) => {
      const updatedErrors = [...prev.testCases];
      updatedErrors.splice(index, 1);
      return { ...prev, testCases: updatedErrors };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build a fresh errors object
    let newErrors = {
      name: !experiment.name.trim(),
      systemPrompt: !experiment.systemPrompt.trim(),
      model: !experiment.model.trim(),
      testCases: [] as {
        userMessage: boolean;
        expectedOutput: boolean;
        grader: boolean;
      }[],
    };

    // Validate each test case
    newErrors.testCases = experiment.testCases.map((tc) => ({
      userMessage: !tc.userMessage.trim(),
      expectedOutput: !tc.expectedOutput.trim(),
      grader: !tc.grader,
    }));

    setErrors(newErrors);

    const hasTopLevelError =
      newErrors.name || newErrors.systemPrompt || newErrors.model;

    const hasTestCaseError = newErrors.testCases.some(
      (tcErr) => tcErr.userMessage || tcErr.expectedOutput || tcErr.grader
    );

    if (hasTopLevelError || hasTestCaseError) {
      return;
    }

    onCreate(experiment);

    // Reset form
    setExperiment({
      id: "",
      name: "",
      systemPrompt: "",
      model: "",
      testCases: [],
    });
    setErrors({
      name: false,
      systemPrompt: false,
      model: false,
      testCases: [],
    });
  }

  return (
    <div className="bg-white shadow-lg rounded-md p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Experiment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Row (ID field removed) */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Experiment Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={experiment.name}
            onChange={handleFieldChange}
            className={`${getInputClasses(errors.name)} mb-2 border`}
          />
        </div>

        {/* System Prompt & Model Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="systemPrompt"
              className="block text-sm font-medium text-gray-700"
            >
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={experiment.systemPrompt}
              onChange={handleFieldChange}
              className={
                errors.systemPrompt
                  ? "mt-1 block w-full h-24 rounded border-red-600 shadow-sm focus:border-red-600 focus:ring-red-600 border"
                  : "mt-1 block w-full h-24 rounded border-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 border"
              }
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Select Model
          </label>
          <select
            id="model"
            name="model"
            value={experiment.model}
            onChange={handleModelChange}
            className={`${getInputClasses(errors.name)} mb-2 border`}
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>

        <hr className="my-6" />

        {/* Test Cases */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          {experiment.testCases.length === 0 && (
            <p className="text-gray-600 mb-2">No test cases added yet.</p>
          )}

          {experiment.testCases.map((testCase, index) => {
            const tcError = errors.testCases[index] || {
              userMessage: false,
              expectedOutput: false,
              grader: false,
            };

            return (
              <div
                key={testCase.id}
                className="border border-gray-300 rounded p-4 mb-4"
              >
                <div className="flex flex-col sm:flex-row sm:space-x-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      User Message
                    </label>
                    <input
                      type="text"
                      value={testCase.userMessage}
                      onChange={(e) =>
                        handleTestCaseFieldChange(
                          index,
                          "userMessage",
                          e.target.value
                        )
                      }
                      className={
                        tcError.userMessage
                          ? "mt-1 block w-full rounded border-red-600 shadow-sm focus:border-red-600 focus:ring-red-600 border"
                          : "mt-1 block w-full rounded border-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 border"
                      }
                    />
                  </div>
                  <div className="flex-1 mt-2 sm:mt-0">
                    <label className="block text-sm font-medium text-gray-700">
                      Expected Output
                    </label>
                    <input
                      type="text"
                      value={testCase.expectedOutput}
                      onChange={(e) =>
                        handleTestCaseFieldChange(
                          index,
                          "expectedOutput",
                          e.target.value
                        )
                      }
                      className={
                        tcError.expectedOutput
                          ? "mt-1 block w-full rounded border-red-600 shadow-sm focus:border-red-600 focus:ring-red-600 border"
                          : "mt-1 block w-full rounded border-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 border"
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4 items-start sm:items-end mb-2">
                  <div className="sm:flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Grader
                    </label>
                    <select
                      value={testCase.grader}
                      onChange={(e) =>
                        handleTestCaseFieldChange(
                          index,
                          "grader",
                          e.target.value
                        )
                      }
                      className={
                        tcError.grader
                          ? "mt-1 block w-full rounded border-red-600 shadow-sm focus:border-red-600 focus:ring-red-600 border"
                          : "mt-1 block w-full rounded border-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 border"
                      }
                    >
                      <option value="exact">exact</option>
                      <option value="partial">partial</option>
                      <option value="llm_match">llm_match</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(index)}
                    className="mt-4 sm:mt-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddTestCase}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Test Case
          </button>
        </div>

        <hr className="my-6" />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateExperiment;
