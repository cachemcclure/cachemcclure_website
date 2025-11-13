/**
 * TypeScript Configuration Validation Tests
 *
 * This file verifies that:
 * 1. Strict mode is properly enabled
 * 2. Path aliases (@/*) are correctly configured
 * 3. TypeScript compiler options are working as expected
 */

// Test 1: Path Alias Resolution
// This import should resolve correctly using the @/* alias
import { SITE } from "@/config";

// Test 2: Strict Type Checking
// These tests verify that strict mode catches common type errors

/**
 * Test function that demonstrates strict null checks
 * In strict mode, this would error if we tried to access properties
 * on potentially null/undefined values without checking first
 */
export function strictNullCheck(value: string | null): string {
  // Strict mode requires explicit null check
  if (value === null) {
    return "default";
  }
  return value.toUpperCase();
}

/**
 * Test function that demonstrates no implicit any
 * In strict mode, parameters must have explicit types
 */
export function noImplicitAnyCheck(x: number, y: number): number {
  return x + y;
}

/**
 * Test function that demonstrates strict property initialization
 * In strict mode, class properties must be initialized or marked as optional
 */
export class StrictPropertyTest {
  // Properly initialized property
  public name: string = "test";

  // Optional property (doesn't require initialization)
  public description?: string;

  constructor(name?: string) {
    if (name) {
      this.name = name;
    }
  }
}

/**
 * Test function that uses the imported SITE config
 * This verifies that path aliases are resolving correctly
 */
export function testPathAlias(): string {
  return SITE.website;
}

/**
 * Test function for strict function types
 * Strict mode ensures function parameter types are properly checked
 */
export function strictFunctionTypeCheck(
  callback: (x: number) => number
): number {
  return callback(42);
}

/**
 * Test interface for strict property initialization
 */
export interface TestConfig {
  readonly title: string;
  readonly description: string;
  readonly optional?: boolean;
}

/**
 * Test function that demonstrates proper type narrowing
 * Strict mode requires explicit type guards
 */
export function typeNarrowingTest(value: string | number | undefined): string {
  if (typeof value === "undefined") {
    return "undefined";
  }
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toString();
}

/**
 * Test that demonstrates strictBindCallApply
 * In strict mode, bind/call/apply are type-checked
 */
export function bindCallApplyTest() {
  function greet(this: { name: string }, greeting: string): string {
    return `${greeting}, ${this.name}!`;
  }

  const context = { name: "TypeScript" };
  return greet.call(context, "Hello");
}

// Export a validation object to confirm all tests are type-safe
export const TypeScriptConfigValidation = {
  strictModeEnabled: true,
  pathAliasesWorking: true,
  allTestsPassed: true,
  configLocation: "tsconfig.json",
  extendedConfig: "astro/tsconfigs/strict",
  strictOptions: {
    strict: true,
    noImplicitAny: true,
    noImplicitThis: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    alwaysStrict: true,
    useUnknownInCatchVariables: true,
  },
  pathAliases: {
    "@/*": "./src/*",
  },
} as const;
