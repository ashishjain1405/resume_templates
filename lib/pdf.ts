// Cache unpdf module at module level so WASM is only initialized once per container
let _unpdf: typeof import('unpdf') | null = null
async function getUnpdf() {
  if (!_unpdf) _unpdf = await import('unpdf')
  return _unpdf
}

export async function parsePdf(buf: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await getUnpdf()
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

// Render HTML to an A4 PDF via headless Chromium
export async function renderPdf(html: string): Promise<Buffer> {
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
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
