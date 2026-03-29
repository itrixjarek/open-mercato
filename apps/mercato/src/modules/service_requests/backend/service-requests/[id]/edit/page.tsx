"use client"
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Page, PageBody } from '@open-mercato/ui/backend/Page'
import { CrudForm, type CrudField, type CrudFormGroup } from '@open-mercato/ui/backend/CrudForm'
import { fetchCrudList, updateCrud, deleteCrud } from '@open-mercato/ui/backend/utils/crud'
import { pushWithFlash } from '@open-mercato/ui/backend/utils/flash'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import type { ServiceRequestListItem } from '../../../../types'

type FormValues = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  reporter_name: string
  reporter_email: string
}

export default function EditServiceRequestPage({ params }: { params?: { id?: string } }) {
  const t = useT()
  const router = useRouter()
  const id = params?.id
  const [initial, setInitial] = React.useState<FormValues | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)

  const fields = React.useMemo<CrudField[]>(() => [
    {
      id: 'title',
      label: t('service_requests.form.fields.title.label'),
      type: 'text',
      required: true,
      placeholder: t('service_requests.form.fields.title.placeholder'),
    },
    {
      id: 'description',
      label: t('service_requests.form.fields.description.label'),
      type: 'textarea',
      placeholder: t('service_requests.form.fields.description.placeholder'),
    },
    {
      id: 'status',
      label: t('service_requests.form.fields.status.label'),
      type: 'select',
      options: [
        { value: 'new', label: t('service_requests.status.new') },
        { value: 'in_progress', label: t('service_requests.status.in_progress') },
        { value: 'resolved', label: t('service_requests.status.resolved') },
        { value: 'closed', label: t('service_requests.status.closed') },
      ],
    },
    {
      id: 'priority',
      label: t('service_requests.form.fields.priority.label'),
      type: 'select',
      options: [
        { value: 'low', label: t('service_requests.priority.low') },
        { value: 'normal', label: t('service_requests.priority.normal') },
        { value: 'high', label: t('service_requests.priority.high') },
        { value: 'critical', label: t('service_requests.priority.critical') },
      ],
    },
    {
      id: 'reporter_name',
      label: t('service_requests.form.fields.reporterName.label'),
      type: 'text',
      placeholder: t('service_requests.form.fields.reporterName.placeholder'),
    },
    {
      id: 'reporter_email',
      label: t('service_requests.form.fields.reporterEmail.label'),
      type: 'text',
      placeholder: t('service_requests.form.fields.reporterEmail.placeholder'),
    },
  ], [t])

  const groups = React.useMemo<CrudFormGroup[]>(() => [
    { id: 'details', title: t('service_requests.form.groups.details'), column: 1, fields: ['title', 'description'] },
    { id: 'meta', title: t('service_requests.form.groups.meta'), column: 2, fields: ['status', 'priority'] },
    { id: 'reporter', title: t('service_requests.form.groups.reporter'), column: 1, fields: ['reporter_name', 'reporter_email'] },
  ], [t])

  const successRedirect = React.useMemo(
    () => `/backend/service-requests?flash=${encodeURIComponent(t('service_requests.form.flash.saved'))}&type=success`,
    [t],
  )

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) return
      setLoading(true)
      setErr(null)
      try {
        const data = await fetchCrudList<ServiceRequestListItem>('service-requests', { id: String(id), pageSize: 1 })
        const item = data?.items?.[0]
        if (!item) throw new Error(t('service_requests.form.error.notFound'))
        if (!cancelled) {
          setInitial({
            id: item.id,
            title: item.title,
            description: item.description ?? '',
            status: item.status,
            priority: item.priority,
            reporter_name: item.reporter_name ?? '',
            reporter_email: item.reporter_email ?? '',
          })
        }
      } catch (error: unknown) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : t('service_requests.form.error.load')
          setErr(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, t])

  const fallback = React.useMemo<FormValues>(() => ({
    id: id ?? '',
    title: '',
    description: '',
    status: 'new',
    priority: 'normal',
    reporter_name: '',
    reporter_email: '',
  }), [id])

  if (!id) return null

  return (
    <Page>
      <PageBody>
        {err ? (
          <div className="text-red-600">{err}</div>
        ) : (
          <CrudForm<FormValues>
            title={t('service_requests.edit.title')}
            backHref="/backend/service-requests"
            fields={fields}
            groups={groups}
            initialValues={initial ?? fallback}
            submitLabel={t('service_requests.form.edit.submit')}
            cancelHref="/backend/service-requests"
            successRedirect={successRedirect}
            isLoading={loading}
            loadingMessage={t('service_requests.form.loading')}
            onSubmit={async (vals) => { await updateCrud('service-requests', vals) }}
            onDelete={async () => {
              if (!id) return
              try {
                await deleteCrud('service-requests', String(id))
                pushWithFlash(router, '/backend/service-requests', t('service_requests.form.flash.deleted'), 'success')
              } catch (error) {
                const message = error instanceof Error ? error.message : t('service_requests.table.error.delete')
                setErr(message)
              }
            }}
          />
        )}
      </PageBody>
    </Page>
  )
}
