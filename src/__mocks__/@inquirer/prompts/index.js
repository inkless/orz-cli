import { vi } from 'vitest';

// Create a mock function for the input prompt
const input = vi.fn();

// Create a mock function for the select prompt that always resolves to the first choice
const select = vi.fn().mockImplementation(async ({ choices }) => {
  // Return the first choice if choices is an array
  if (Array.isArray(choices) && choices.length > 0) {
    return choices[0].value;
  }

  // Return a default mock response if no choices
  return { id: '10001', name: 'Story' };
});

// Export all the mocked functions
export { input, select };
export default { input, select };
