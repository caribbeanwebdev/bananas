# Zoo Food Audit Tool 🍌

A TypeScript CLI tool that reconciles food deliveries, usage logs, and inventory counts to produce a discrepancy report for Willowbrook Zoo.

## The Great Banana Mystery

Every week, food inventory doesn't quite match what it should. This tool helps identify discrepancies between what was delivered, what was used, and what remains in inventory.

## Quick Start

```bash
# Install dependencies
npm install

# Build and run the audit
npm run audit

# Run tests
npm test
```

## Build and Run

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the Audit

```bash
# Build and run with default data directory (./data)
npm run audit

# Or build and run separately
npm run build
npm run start

# With custom data directory
node dist/main.js --data /path/to/data

# Output as JSON
node dist/main.js --format json

# With debug logging
node dist/main.js --log-level debug
```

### CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--data <dir>` | `-d` | Data directory containing input files (default: `./data`) |
| `--format <fmt>` | `-f` | Output format: `text` or `json` (default: `text`) |
| `--log-level <lvl>` | `-l` | Log level: `debug`, `info`, `warn`, `error` (default: `info`) |
| `--help` | `-h` | Show help message |

## Input Files

The tool expects three files in the data directory:

1. **delivery.txt** - Properties format (what arrived at start of week)
2. **usage.csv** - CSV format (keeper logs throughout the week)
3. **inventory.json** - JSON format (stock count at end of week)

See the `data/` directory for sample files.

## Sample Output

Running `npm run audit` with the sample data produces:

```
Zoo Food Audit Report
=====================

banana: DISCREPANCY -7 (expected: 25, actual: 18)
carrots: OK
fish: OK
hay: OK
lettuce: UNKNOWN (empty value in delivery file)
meat: OK

Summary: 1 discrepancy found, 1 item with missing data

Report generated: 2025-12-01T13:48:47.117Z
```

**Verdict**: 7 bananas are missing! The chimps are indeed the prime suspects. 🐒

## Project Structure

```
src/
├── parsers/                   # File format parsers
│   ├── delivery.parser.ts     # Properties format parser
│   ├── usage.parser.ts        # CSV parser
│   ├── inventory.parser.ts    # JSON parser
│   └── index.ts
│
├── services/
│   ├── reconciliation/        # Core business logic
│   │   ├── reconciliation.service.ts
│   │   └── index.ts
│   └── reporting/             # Report generation
│       ├── reporting.service.ts
│       └── index.ts
│
├── lib/
│   ├── types.ts               # Domain types
│   ├── result.ts              # Result<T,E> type
│   └── logger.ts              # Simple console logger
│
├── __tests__/                 # Unit tests
│
└── main.ts                    # CLI entry point
```

## Key Design Decisions

### 1. Clean Separation of Concerns
- **Parsers**: Handle file format conversion (not services)
- **Services**: Business logic only (reconciliation, reporting)
- **Lib**: Shared utilities and types

### 2. Result Type Pattern
Operations that can fail return `Result<T, E>` instead of throwing:
```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### 3. Immutable Data Structures
All types are `readonly` to prevent shared mutable state, safe for multi-threaded environments.

### 4. Discriminated Unions for Data Validity
```typescript
type FoodQuantity =
  | { status: 'valid'; value: number }
  | { status: 'missing'; reason: string };
```

### 5. Simple Logging
Basic console logger with log levels (debug, info, warn, error). No external dependencies.

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Dependencies

### Development Only
- **typescript** - Type safety
- **jest** - Testing framework
- **ts-jest** - TypeScript support for Jest

No production dependencies - pure Node.js.

## Assumptions

1. Item names are case-insensitive (normalized to lowercase)
2. Quantities are always non-negative integers
3. If an item appears only in usage/inventory but not in delivery, it's treated as unknown
4. Empty delivery values (`lettuce=`) mean data is missing, not zero
5. Quoted values in delivery file (`carrots="20"`) should have quotes stripped

## Approach

**Process**: Types-first development - defined domain types, then parsers, then business logic, then CLI.

**Tools**: Claude Code (AI assistant), TypeScript, Node.js, Jest.

**Tech Selection**: No external runtime dependencies - native Node.js parsing for simple formats. TypeScript strict mode for safety.

## Feedback

This was a well-designed assignment! The requirements were clear, and the three different file formats added realistic complexity without being tedious. The "multi-threaded environment" requirement was a nice touch that encouraged good immutable design patterns. The banana mystery theme made it fun. 🐒

---

*Generated with Claude Code*
