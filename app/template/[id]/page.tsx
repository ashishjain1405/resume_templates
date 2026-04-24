import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import { createClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import TemplateDetailClient from './TemplateDetailClient'

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Suspense>
        <TemplateDetailClient template={template} purchased={purchased} />
      </Suspense>
    </div>
  )
}
