"use client"
import * as React from 'react'
import { Page, PageBody } from '@open-mercato/ui/backend/Page'
import { CrudForm, type CrudField, type CrudFormGroup } from '@open-mercato/ui/backend/CrudForm'
import { createCrud } from '@open-mercato/ui/backend/utils/crud'
import { useT } from '@open-mercato/shared/lib/i18n/context'

export default function CreateServiceRequestPage() {
  const t = useT()

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
    () => `/backend/service-requests?flash=${encodeURIComponent(t('service_requests.form.flash.created'))}&type=success`,
    [t],
  )

  return (
    <Page>
      <PageBody>
        <CrudForm
          title={t('service_requests.create.title')}
          backHref="/backend/service-requests"
          fields={fields}
          groups={groups}
          submitLabel={t('service_requests.form.create.submit')}
          cancelHref="/backend/service-requests"
          successRedirect={successRedirect}
          onSubmit={async (vals) => { await createCrud('service-requests', vals) }}
        />
      </PageBody>
    </Page>
  )
}
