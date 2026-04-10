---
description: Check whether existing implementation needs to be refactored or whether it is functional. 
---

# Status Check & Refactor Workflow

**Goal:** Audit existing code against the corpus of rules without rewriting logic unnecessarily.

## Step 1: Static Analysis
1. Check imports: Are we importing heavy libraries for simple tasks? (e.g., using Lodash for a simple map).
2. Check re-renders: Are object literals `{}` or arrow functions `() => {}` being passed directly into Props inside a render loop? (Flag as violation of `rules/code-quality.md`).

## Step 2: Test Coverage Gap Analysis
1. Look for conditional logic (`if/else`, `ternary`).
2. check if existing tests cover both branches.
3. If not, generate the missing test case.

## Step 3: Optimization Proposal
1. Identify any synchronous heavy lifting that blocks the JS thread.
2. Suggest moving it to an InteractionManager or Worker.