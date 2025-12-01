# The Great Banana Mystery 🍌

## Code Assignment for Senior Backend Developer

### Use Any Tools

You're encouraged to use AI tooling such as Claude Code, Cline, Codex, Cursor, Windsurf, etc., 3rd party libraries, documentation, or whatever you deem fit for purpose in production. We're evaluating the output, not the process.

---

### The Situation

Willowbrook Zoo has a problem. Every week, food inventory doesn't quite match what it should. The discrepancies are small but persistent. Management suspects the chimps have figured out how to steal bananas from the keeper's supply bag, but they can't prove it.

Your job: build a tool that reconciles food deliveries, usage logs, and current inventory to produce a discrepancy report. We don't want to accuse the chimps if they're innocent.

The zoo director is keen to grow this into a larger SaaS system shared with other zoos — adding finance integration, automated restock alerts, and more. The exact features and priorities aren't known yet, so the code should be ready to evolve.

---

### Input Files

You receive three files, each in a different format (because of course they are — the delivery system is from 2003, the keepers log usage on paper that gets transcribed to CSV, and the new inventory system exports JSON).

**Note:** You can assume `usage.csv` and `inventory.json` are always **valid** (correct format, clean data). The `delivery.txt` file may contain invalid *values* (empty or quoted), but parameter names are always well-formatted.

#### 1. `delivery.txt` — Properties format

What arrived at the start of the week. Parameter names are always well-formatted, but values may need handling (empty or quoted).

```
banana=50
fish=100
hay=200
meat=75
lettuce=
carrots="20"
```

#### 2. `usage.csv` — CSV format

Keeper logs throughout the week. Multiple entries per food type. Always valid CSV.

```
food,quantity
banana,8
fish,25
banana,12
hay,50
meat,20
fish,30
banana,5
hay,45
meat,18
fish,40
carrots,5
carrots,8
```

#### 3. `inventory.json` — JSON format

Stock count at end of week. Always valid JSON.

```json
[
  { "item": "banana", "quantity": 18 },
  { "item": "fish", "quantity": 5 },
  { "item": "hay", "quantity": 105 },
  { "item": "meat", "quantity": 37 },
  { "item": "carrots", "quantity": 7 },
  { "item": "lettuce", "quantity": 0 }
]
```

---

### Expected Output

A discrepancy report. Format is up to you, but it must be clear. Example:

```
Zoo Food Audit Report
=====================

banana: DISCREPANCY -7 (expected: 25, actual: 18) 
fish: OK
hay: OK
meat: OK
carrots: OK
lettuce: UNKNOWN (missing data)

Summary: 1 discrepancy found
```

---

### Technical Requirements

- **TypeScript** with strict mode (`strict: true`)
- Assume this may run in a **multi-threaded environment** — no shared mutable state
- Code should be **production-ready**: think troubleshooting, resilience, usability

---

### Deliverables

1. **Source code** via GitHub repo or zip file
2. **README** with:
   - How to build and run with the sample data so that we can finally get an answer on the big banana mystery!
   - Brief explanation of key design decisions
   - Short description of your approach (process, tools used, tech selection)
   - Feedback on this assignment (fun? painful? meh? rather not say?)
3. **Sample output** from running against the provided test files

---

### Time Expectation

This should take approximately **2–3 hours**. If you find it takes more, please feel free to stop and leave a comment in the README — a well-designed partial solution beats a messy complete one.

---

### Evaluation Criteria

| Area | What We're Looking For |
|------|------------------------|
| **Correctness** | Produces the right answer |
| **Design** | Clear separation of concerns, appropriate abstractions |
| **Operability** | Troubleshooting, resilience, usability |
| **Code Quality** | Readable, well-named, idiomatic TypeScript, Clean Code |
| **Changeability** | How easy is it to clean up, refactor, and evolve this code as the director's vision grows? |
| **Pragmatism** | No over-engineering, sensible trade-offs |

---

### Questions?

If something is ambiguous, make a reasonable assumption and document it. Real-world specs are never perfect.

Good luck — and if you find the missing bananas, let us know. 🐒
