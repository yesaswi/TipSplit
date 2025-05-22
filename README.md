# TipSplit

This is a Next.js application called TipSplit, designed to help users calculate tips and split bills among friends. It features AI-powered tip suggestions based on service quality.

## Getting Started

This project is built with Next.js and uses Genkit for AI features.

To get started:
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
   The application will be available at `http://localhost:9002`.

The main application logic can be found in `src/app/page.tsx` and `src/components/tip-calculator.tsx`.
AI flow for tip suggestion is located in `src/ai/flows/suggest-tip-percentage.ts`.

## Features

- Input bill amount, desired tip percentage, and number of people.
- Calculates total tip, total bill, and individual share.
- Option to round the total bill to the nearest dollar.
- AI-powered suggestions for tip percentage based on a description of service quality.
- Clear display of results.
- Styled with a soft pink and purple color scheme.
