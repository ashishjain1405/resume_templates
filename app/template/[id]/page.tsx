import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TEMPLATES, formatPrice } from '@/lib/templates'
import { createClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import BuyButton from '@/components/BuyButton'
import ClassicPreview from '@/components/resume-previews/Classic'
import ModernPreview from '@/components/resume-previews/Modern'
import MulticolumnPreview from '@/components/resume-previews/Multicolumn'
import QuotationPreview from '@/components/resume-previews/Quotation'
import ExecutivePreview from '@/components/resume-previews/Executive'

const PREVIEW_MAP: Record<string, React.ComponentType<{ accentColor?: string }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  multicolumn: MulticolumnPreview,
  quotation: QuotationPreview,
  executive: ExecutivePreview,
}

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const template = TEMPLATES.find((t) => t.id === id)
  if (!template) return {}
  return {
    title: `${template.name} Resume Template`,
    description: `${template.description} ATS-friendly, one-time purchase. Download instantly in PDF & DOCX.`,
    alternates: { canonical: `https://www.resumenow.in/template/${id}` },
    openGraph: {
      title: `${template.name} Resume Template | Resume Expert`,
      description: template.description,
      url: `https://www.resumenow.in/template/${id}`,
    },
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = TEMPLATES.find((t) => t.id === id)
  if (!template) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let purchased = false
  if (user) {
    const [{ data }, pro] = await Promise.all([
      supabase.from('purchases').select('id').eq('user_id', user.id).eq('template_id', id).maybeSingle(),
      isPro(user.id, supabase),
    ])
    purchased = !!data || pro
  }

  const Preview = PREVIEW_MAP[id] ?? ClassicPreview

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Resume preview */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg" style={{ height: '520px' }}>
            <Preview accentColor={template.colors[0]} />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
            {template.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
          <p className="text-gray-500 mb-4">{template.description}</p>

          <div className="flex items-center gap-2 mb-6">
            {template.colors.map((color) => (
              <div
                key={color}
                className="w-5 h-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Format</span>
              <span className="font-medium">PDF + DOCX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">License</span>
              <span className="font-medium">Lifetime access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ATS-friendly</span>
              <span className="font-medium text-green-600">Yes ✓</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-900">Price</span>
              <span className="font-bold text-xl text-blue-600">{formatPrice(template.price_inr)}</span>
            </div>
          </div>

          <BuyButton template={template} purchased={purchased} />

          {!purchased && (
            <p className="text-xs text-gray-400 text-center mt-3">
              One-time payment. No subscription. No expiry.
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/builder/${template.id}`}
              className="w-full block text-center border border-blue-600 text-blue-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Build resume with this template →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
