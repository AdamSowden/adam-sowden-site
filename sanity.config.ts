import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'adam-sowden-site',
  title: 'Adam Sowden',
  basePath: '/studio',

  // Environment variables set in Vercel (Production, Preview, Development)
  // and locally in .env.local
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
