# Specification

## Summary
**Goal:** Fix the admin login authentication so that correct credentials are accepted and the admin dashboard opens successfully.

**Planned changes:**
- Fix the backend `adminLogin` function to correctly validate the admin password and return a successful session token for valid credentials.
- Fix the frontend login handler to correctly process the successful response and navigate to the admin dashboard.
- Ensure the "Login failed. Please try again." error message only appears for incorrect passwords, not valid ones.
- Persist the admin session token in localStorage after successful login.

**User-visible outcome:** Entering the correct admin password and clicking "Sign in" successfully opens the admin dashboard without showing the "Login failed. Please try again." error.
