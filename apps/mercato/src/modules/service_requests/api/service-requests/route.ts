import { z } from 'zod'
import { makeCrudRoute } from '@open-mercato/shared/lib/crud/factory'
import { ServiceRequest } from '../../data/entities'
import type { ServiceRequestListItem } from '../../types'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'

const querySchema = z
  .object({
    id: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(50),
    sortField: z.string().optional().default('created_at'),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
    title: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
  })
  .passthrough()

const rawBodySchema = z.object({}).passthrough()

type Query = z.infer<typeof querySchema>

export const { metadata, GET, POST, PUT, DELETE } = makeCrudRoute({
  metadata: {
    GET: { requireAuth: true, requireFeatures: ['service_requests.view'] },
    POST: { requireAuth: true, requireFeatures: ['service_requests.manage'] },
    PUT: { requireAuth: true, requireFeatures: ['service_requests.manage'] },
    DELETE: { requireAuth: true, requireFeatures: ['service_requests.manage'] },
  },
  orm: {
    entity: ServiceRequest,
    idField: 'id',
    orgField: 'organizationId',
    tenantField: 'tenantId',
    softDeleteField: 'deletedAt',
  },
  list: {
    schema: querySchema,
    fields: [
      'id',
      'title',
      'description',
      'status',
      'priority',
      'reporter_name',
      'reporter_email',
      'tenant_id',
      'organization_id',
      'created_at',
    ],
    sortFieldMap: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      created_at: 'created_at',
    },
    buildFilters: async (q: Query) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: Record<string, any> = {}
      if (q.id) filters.id = q.id
      if (q.title) filters.title = { $ilike: `%${q.title}%` }
      if (q.status) filters.status = q.status
      if (q.priority) filters.priority = q.priority
      return filters
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformItem: (item: any): ServiceRequestListItem => ({
      id: String(item.id),
      title: String(item.title),
      description: item.description ?? null,
      status: String(item.status),
      priority: String(item.priority),
      reporter_name: item.reporter_name ?? null,
      reporter_email: item.reporter_email ?? null,
      tenant_id: item.tenant_id ?? null,
      organization_id: item.organization_id ?? null,
    }),
  },
  actions: {
    create: {
      commandId: 'service_requests.service_requests.create',
      schema: rawBodySchema,
      mapInput: ({ parsed }) => parsed,
      response: ({ result }) => ({ id: String(result.id) }),
      status: 201,
    },
    update: {
      commandId: 'service_requests.service_requests.update',
      schema: rawBodySchema,
      mapInput: ({ parsed }) => parsed,
      response: () => ({ ok: true }),
    },
    delete: {
      commandId: 'service_requests.service_requests.delete',
      response: () => ({ ok: true }),
    },
  },
})

export const openApi: OpenApiRouteDoc = {
  GET: { summary: 'List service requests', tags: ['service_requests'] },
  POST: { summary: 'Create a service request', tags: ['service_requests'] },
  PUT: { summary: 'Update a service request', tags: ['service_requests'] },
  DELETE: { summary: 'Delete a service request', tags: ['service_requests'] },
}
