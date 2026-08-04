import { Employee } from "../types/employees.types";
import { MOCK_EMPLOYEES } from "../data/employees.data";

/**
 * Emulates a fetch call to retrieve the list of employees.
 * Can be directly updated with a real `fetch` / axios call once backend APIs are ready.
 */
export const getEmployees = async (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EMPLOYEES);
    }, 400); // simulated network latency
  });
};
