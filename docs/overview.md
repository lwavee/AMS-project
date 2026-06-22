# Project Overview

## Introduction
This directory contains architectural documentation, UI guidelines, and data mapping specifications for the AMS-project. 

The primary goal of this project is to modernize a legacy desktop application (similar to AMS360) into a premium, responsive, web-based platform known internally as the **Sterling Insurance** web theme.

## Core Architectural Shifts

### 1. Web-Native UI Modernization
We have deliberately moved away from "WinXP-era" desktop UI paradigms (e.g., dense fake dropdown menu bars like File/Section/Window, tightly packed beige grids). 
Instead, the new platform utilizes:
- **Tailwind CSS** for rapid utility-based styling.
- **Modern Layouts:** Wide, breathable panels (`rounded-2xl`, `bg-white`, `border-border-main`), soft drop-shadows, and sticky headers with `backdrop-blur`.
- **Data Clarity:** Data points that were once hidden behind complex accordion tabs are now cleanly rendered into open, highly visible grid layouts.

### 2. State Management & Data Flow
The application bridges complex data entry from multiple endpoints:
- **Creation Flow (`new-policy/page.tsx`):** Captures extensive structured data ranging from business units to complex boolean flags (e.g., Premium Financed, Reinsurance).
- **Detail View (`policy/[policyId]/page.tsx`):** Reads the complex policy object via API and dynamically maps it into the UI. Missing or null data gracefully falls back to a clean `—` state to prevent UI breakage.

## Further Reading
- **[UI Architecture & Design Language](./ui-architecture.md):** Guidelines for building new pages and components to match the Sterling Insurance theme.
- **[Policy Management & Interactive Tables](./policy-management.md):** Specific deep-dive into the complex logic governing policy details and the inline Line of Business editor.