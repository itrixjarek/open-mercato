"use client"
import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ServiceRequestListItem } from '../types'
import { DataTable } from '@open-mercato/ui/backend/DataTable'
import { RowActions } from '@open-mercato/ui/backend/RowActions'
import type { FilterValues } from '@open-mercato/ui/backend/FilterBar'
import { EnumBadge } from '@open-mercato/ui/backend/ValueIcons'
import { Button } from '@open-mercato/ui/primitives/button'
import { fetchCrudList, deleteCrud } from '@open-mercato/ui/backend/utils/crud'
import { flash } from '@open-mercato/ui/backend/FlashMessages'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { useConfirmDialog } from '@open-mercato/ui/backend/confirm-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ServiceRequestsResponse = {
  items: ServiceRequestListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'Nowe', color: 'blue' },
  in_progress: { label: 'W trakcie', color: 'yellow' },
  resolved: { label: 'Rozwiązane', color: 'green' },
  closed: { label: 'Zamknięte', color: 'gray' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: 'Niski', color: 'gray' },
  normal: { label: 'Normalny', color: 'blue' },
  high: { label: 'Wysoki', color: 'orange' },
  critical: { label: 'Krytyczny', color: 'red' },
}

function buildColumns(t: (key: string) => string): ColumnDef<ServiceRequestListItem>[] {
  return [
    { accessorKey: 'title', header: t('service_requests.table.column.title'), meta: { priority: 1 } },
    {
      accessorKey: 'status',
      header: t('service_requests.table.column.status'),
      meta: { priority: 2 },
      cell: ({ getValue }) => {
        const val = getValue() as string
        const entry = STATUS_MAP[val]
        return <EnumBadge value={val} map={entry ? { [val]: entry } : {}} />
      },
    },
    {
      accessorKey: 'priority',
      header: t('service_requests.table.column.priority'),
      meta: { priority: 3 },
      cell: ({ getValue }) => {
        const val = getValue() as string
        const entry = PRIORITY_MAP[val]
        return <EnumBadge value={val} map={entry ? { [val]: entry } : {}} />
      },
    },
    { accessorKey: 'reporter_name', header: t('service_requests.table.column.reporterName'), meta: { priority: 4 } },
    { accessorKey: 'reporter_email', header: t('service_requests.table.column.reporterEmail'), meta: { priority: 5 } },
  ]
}

export default function ServiceRequestsTable() {
  const t = useT()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialogElement } = useConfirmDialog()
  const [searchTitle, setSearchTitle] = React.useState('')
  const [values, setValues] = React.useState<FilterValues>({})
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'created_at', desc: true }])
  const [page, setPage] = React.useState(1)

  const columns = React.useMemo(() => buildColumns(t), [t])

  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: '50',
      sortField: sorting[0]?.id || 'created_at',
      sortDir: sorting[0]?.desc ? 'desc' : 'asc',
    })
    if (searchTitle) params.set('title', searchTitle)
    const status = values.status
    if (status && typeof status === 'string') params.set('status', status)
    const priority = values.priority
    if (priority && typeof priority === 'string') params.set('priority', priority)
    return params.toString()
  }, [page, sorting, searchTitle, values])

  const { data, isLoading, error } = useQuery<ServiceRequestsResponse>({
    queryKey: ['service_requests', queryParams],
    queryFn: () => fetchCrudList<ServiceRequestListItem>(
      'service-requests',
      Object.fromEntries(new URLSearchParams(queryParams)),
    ),
  })

  if (error) {
    return <div className="text-sm text-destructive">{t('service_requests.table.error.generic')}</div>
  }

  return (
    <>
      <DataTable
        title={t('service_requests.table.title')}
        actions={(
          <Button asChild>
            <Link href="/backend/service-requests/create">{t('service_requests.table.actions.create')}</Link>
          </Button>
        )}
        columns={columns}
        data={data?.items ?? []}
        searchValue={searchTitle}
        onSearchChange={(v) => { setSearchTitle(v); setPage(1) }}
        searchAlign="right"
        filters={[
          {
            id: 'status',
            label: t('service_requests.table.filters.status'),
            type: 'select',
            options: Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label })),
          },
          {
            id: 'priority',
            label: t('service_requests.table.filters.priority'),
            type: 'select',
            options: Object.entries(PRIORITY_MAP).map(([value, { label }]) => ({ value, label })),
          },
        ]}
        filterValues={values}
        onFiltersApply={(vals: FilterValues) => { setValues(vals); setPage(1) }}
        onFiltersClear={() => { setSearchTitle(''); setValues({}); setPage(1) }}
        sortable
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1) }}
        rowActions={(row) => (
          <RowActions
            items={[
              { label: t('service_requests.table.actions.edit'), href: `/backend/service-requests/${row.id}/edit` },
              {
                label: t('service_requests.table.actions.delete'),
                destructive: true,
                onSelect: async () => {
                  const confirmed = await confirm({
                    title: t('service_requests.table.confirm.delete'),
                    variant: 'destructive',
                  })
                  if (!confirmed) return
                  try {
                    await deleteCrud('service-requests', row.id)
                    flash(t('service_requests.form.flash.deleted'), 'success')
                    queryClient.invalidateQueries({ queryKey: ['service_requests'] })
                  } catch {
                    flash(t('service_requests.table.error.delete'), 'error')
                  }
                },
              },
            ]}
          />
        )}
        pagination={{
          page,
          pageSize: 50,
          total: data?.total ?? 0,
          totalPages: data?.totalPages ?? 0,
          onPageChange: setPage,
        }}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/backend/service-requests/${row.id}/edit`)}
      />
      {ConfirmDialogElement}
    </>
  )
}
