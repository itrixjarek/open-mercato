import { registerCommand } from '@open-mercato/shared/lib/commands'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import type { EntityManager, FilterQuery } from '@mikro-orm/postgresql'
import { z } from 'zod'
import { ServiceRequest } from '../data/entities'

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  reporter_name: z.string().optional(),
  reporter_email: z.string().email().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  reporter_name: z.string().optional(),
  reporter_email: z.string().email().optional(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureScope(ctx: any): { tenantId: string; organizationId: string } {
  const tenantId = ctx.auth?.tenantId ?? null
  if (!tenantId) throw new CrudHttpError(400, { error: 'Tenant context is required' })
  const organizationId = ctx.selectedOrganizationId ?? ctx.auth?.orgId ?? null
  if (!organizationId) throw new CrudHttpError(400, { error: 'Organization context is required' })
  return { tenantId, organizationId }
}

registerCommand({
  id: 'service_requests.service_requests.create',
  isUndoable: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(rawInput: any, ctx: any) {
    const parsed = createSchema.parse(rawInput)
    const scope = ensureScope(ctx)
    const em = ctx.container.resolve('em') as EntityManager
    const entity = em.create(ServiceRequest, {
      title: parsed.title,
      description: parsed.description ?? null,
      status: parsed.status ?? 'new',
      priority: parsed.priority ?? 'normal',
      reporterName: parsed.reporter_name ?? null,
      reporterEmail: parsed.reporter_email ?? null,
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
    })
    await em.persistAndFlush(entity)
    return entity
  },
})

registerCommand({
  id: 'service_requests.service_requests.update',
  isUndoable: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(rawInput: any, ctx: any) {
    const parsed = updateSchema.parse(rawInput)
    const scope = ensureScope(ctx)
    const em = ctx.container.resolve('em') as EntityManager
    const entity = await em.findOne(ServiceRequest, {
      id: parsed.id,
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
      deletedAt: null,
    } as FilterQuery<ServiceRequest>)
    if (!entity) throw new CrudHttpError(404, { error: 'Service request not found' })
    if (parsed.title !== undefined) entity.title = parsed.title
    if (parsed.description !== undefined) entity.description = parsed.description
    if (parsed.status !== undefined) entity.status = parsed.status
    if (parsed.priority !== undefined) entity.priority = parsed.priority
    if (parsed.reporter_name !== undefined) entity.reporterName = parsed.reporter_name
    if (parsed.reporter_email !== undefined) entity.reporterEmail = parsed.reporter_email
    await em.flush()
    return entity
  },
})

registerCommand({
  id: 'service_requests.service_requests.delete',
  isUndoable: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(rawInput: any, ctx: any) {
    const id = rawInput?.body?.id ?? rawInput?.query?.id
    if (!id || typeof id !== 'string') throw new CrudHttpError(400, { error: 'ID required' })
    const scope = ensureScope(ctx)
    const em = ctx.container.resolve('em') as EntityManager
    const entity = await em.findOne(ServiceRequest, {
      id,
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
      deletedAt: null,
    } as FilterQuery<ServiceRequest>)
    if (!entity) throw new CrudHttpError(404, { error: 'Service request not found' })
    entity.deletedAt = new Date()
    await em.flush()
    return entity
  },
})
