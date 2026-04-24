/**
 * One-time script: generate PDFs for all templates and upload to Supabase storage.
 * Run with: npx ts-node --project tsconfig.json scripts/generate-template-pdfs.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually (dotenv not available)
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

import { createClient } from '@supabase/supabase-js'
import { TEMPLATES } from '../lib/templates'
import { SAMPLE_RESUME } from '../lib/resume-data'
import { buildResumeHtml } from '../lib/build-resume-html'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function generateAndUpload() {
  const chromium = require('@sparticuz/chromium-min')
  const puppeteer = require('puppeteer-core')

  const executablePath = await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar'
  )

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  })

  try {
    for (const template of TEMPLATES) {
      console.log(`Generating ${template.id}...`)
      const html = buildResumeHtml(SAMPLE_RESUME, template.colors[0], template.id)

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      await page.close()

      const { error } = await supabase.storage
        .from('templates')
        .upload(template.storage_path_pdf, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (error) {
        console.error(`  Failed to upload ${template.id}:`, error.message)
      } else {
        console.log(`  Uploaded to ${template.storage_path_pdf}`)
      }
    }
  } finally {
    await browser.close()
  }

  console.log('Done.')
}

generateAndUpload().catch(console.error)
