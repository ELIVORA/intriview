# SHARED DATA WORKSPACE 🤝

This directory hosts data transfer contracts, enums, and utility constants that are synchronized between our Frontend (TypeScript) and Backend (Python) codebases.

---

## 🗃️ Content Directory

- `/shared/constants/`: Standardized error code names, permission lists, and system thresholds.
- `/shared/types/`: Base JSON configurations easily convertible to both TypeScript interfaces and Pydantic validation schemas.

---

## ⚙️ Synced Schema Checklist

To introduce or extend shared objects:
1. Declare the changes inside `/shared/` to clarify structural attributes.
2. Regenerate the TypeScript representations under `src/types/` or compile backend schemas under `backend/app/schemas/`.
