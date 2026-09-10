# Agent Instructions & Project Guidelines

## 1. Source Control & Branching
- Always create and switch to a new Git branch (`feature/<name>`) before creating or editing files.
- Never make direct commits or merges without asking for explicit user permission.
- Ensure `AGENTS.md` remains present and tracked across all branches and `main`.

## 2. Versioning & Release Protocol (Three-Tiered SemVer)
- **Mandatory Version Increment**: Every PR or merge into `main` MUST increment the application version tag prior to merging.
- **Three-Tiered Semantic Numbering Scheme (`V{MAJOR}.{MINOR}.{PATCH}`)**:
  - **PATCH (`V002.1.0` -> `V002.1.1`)**: Increment for bug fixes, data corrections, cosmetic styling tweaks, missing image additions, or routine maintenance merges.
  - **MINOR (`V002.1.0` -> `V002.2.0`)**: Increment for new backwards-compatible features, catalog/series expansions (e.g. new connector families, layouts, or tooling additions), or functional enhancements. Resets PATCH to `0`.
  - **MAJOR (`V002.x.x` -> `V003.0.0`)**: Reserved strictly for milestone architectural shifts, complete UI redesigns, or breaking framework migrations (e.g. migrating to corporate Django/Vue.js architecture). Resets MINOR and PATCH to `0`.
- **Files to Synchronize on Every Version Bump**:
  1. `app.js`: Update the `CONFIG_VERSION` constant (e.g., `const CONFIG_VERSION = "V002.1.0";`).
  2. `index.html`: Update the `<title>` tag and the `<span class="version-tag">` header badge.
- **Git Tagging**:
  - After merging into `main`, tag the merge commit matching the release version (e.g. `git tag -a v002.1.1 -m "Release V002.1.1"` and `git push origin v002.1.1`).

## 3. Planning & Implementation Workflow
- For any request that involves generating or modifying code, always create or update an `implementation_plan.md` artifact first.
- Do not write code or edit files until the implementation plan is presented and approved by the user.

## 4. Frontend Verification & "Definition of Done"
- **Mandatory Live Browser Verification**: Never rely solely on static linters, JSON checks, or engine regression scripts (`validate.ps1`, `test-regression.ps1`) to declare UI work complete.
- Before notifying the user that frontend work is ready for review:
  1. Inspect the live rendered DOM or run automated browser checks (e.g., using headless Edge/Chrome or Playwright scripts).
  2. Verify that there are zero JavaScript runtime console errors on page load.
  3. Verify that all interactive controls (dropdowns, inputs, buttons) are visible, populated with valid options, and respond to input.
  4. Perform an end-to-end user journey: input sample values, click "Calculate", and confirm that cards, images, and tables physically render in the DOM.

## 5. UI/UX & Visual Design Standards
- Maintain visual hierarchy, card padding, and professional styling consistent with the established design system (`styles.css`).
- When reordering or restructuring UI sections, ensure logical top-to-bottom flow, clear section dividers, and intuitive button positioning (e.g., "Calculate" at the logical completion point).
- Avoid ugly or cluttered dropdown text (e.g., avoid crude text appending like `(Too small)` in select options if it disrupts clean presentation). Prefer clean status badges, helper text, or disabled states with clear visual affordances.

## 6. Shell & Operating System Invariants
- The host system runs **Windows PowerShell**.
- Never execute Unix/bash-specific syntax (e.g., `cat << 'EOF'`, `export VAR=...`, or bash pipeline redirection).
- Use built-in file editing tools (`write_to_file`, `replace_file_content`) or native PowerShell commands for file and system manipulation.

## 7. Communication
- Summarize all progress in plain, non-technical English focusing on user-visible features.
- Provide clear, step-by-step instructions on how the user can test the changes in their browser.

