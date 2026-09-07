# Agent Instructions & Project Guidelines

## 1. Source Control & Branching
- Always create and switch to a new Git branch (`feature/<name>`) before creating or editing files.
- Never make direct commits or merges without asking for explicit user permission.
- Ensure `AGENTS.md` remains present and tracked across all branches and `main`.

## 2. Planning & Implementation Workflow
- For any request that involves generating or modifying code, always create or update an `implementation_plan.md` artifact first.
- Do not write code or edit files until the implementation plan is presented and approved by the user.

## 3. Frontend Verification & "Definition of Done"
- **Mandatory Live Browser Verification**: Never rely solely on static linters, JSON checks, or engine regression scripts (`validate.ps1`, `test-regression.ps1`) to declare UI work complete.
- Before notifying the user that frontend work is ready for review:
  1. Inspect the live rendered DOM or run automated browser checks (e.g., using headless Edge/Chrome or Playwright scripts).
  2. Verify that there are zero JavaScript runtime console errors on page load.
  3. Verify that all interactive controls (dropdowns, inputs, buttons) are visible, populated with valid options, and respond to input.
  4. Perform an end-to-end user journey: input sample values, click "Calculate", and confirm that cards, images, and tables physically render in the DOM.

## 4. UI/UX & Visual Design Standards
- Maintain visual hierarchy, card padding, and professional styling consistent with the established design system (`styles.css`).
- When reordering or restructuring UI sections, ensure logical top-to-bottom flow, clear section dividers, and intuitive button positioning (e.g., "Calculate" at the logical completion point).
- Avoid ugly or cluttered dropdown text (e.g., avoid crude text appending like `(Too small)` in select options if it disrupts clean presentation). Prefer clean status badges, helper text, or disabled states with clear visual affordances.

## 5. Shell & Operating System Invariants
- The host system runs **Windows PowerShell**.
- Never execute Unix/bash-specific syntax (e.g., `cat << 'EOF'`, `export VAR=...`, or bash pipeline redirection).
- Use built-in file editing tools (`write_to_file`, `replace_file_content`) or native PowerShell commands for file and system manipulation.

## 6. Communication
- Summarize all progress in plain, non-technical English focusing on user-visible features.
- Provide clear, step-by-step instructions on how the user can test the changes in their browser.

