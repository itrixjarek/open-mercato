export type ServiceRequestListItem = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  reporter_name: string | null
  reporter_email: string | null
  tenant_id: string | null
  organization_id: string | null
}
