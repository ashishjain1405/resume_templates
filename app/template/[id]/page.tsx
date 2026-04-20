import { notFound } from 'next/navigation'
import { TEMPLATES, formatPrice } from '@/lib/templates'
import { createClient } from '@/lib/supabase-server'
import BuyButton from '@/components/BuyButton'

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }))
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
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('template_id', id)
      .maybeSingle()
    purchased = !!data
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="bg-gray-50 rounded-2xl p-8 aspect-[3/4] flex flex-col gap-3 border border-gray-100">
            <div className="h-5 bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-blue-400 rounded w-1/3" />
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-5/6" />
              <div className="h-2 bg-gray-200 rounded w-4/5" />
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="h-2 bg-gray-300 rounded w-1/3" />
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-5/6" />
              <div className="h-2 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="h-2 bg-gray-300 rounded w-1/4" />
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-2/3" />
            </div>
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
        </div>
      </div>
    </div>
  )
}
