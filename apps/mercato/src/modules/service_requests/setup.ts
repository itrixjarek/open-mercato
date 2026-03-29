import type { ModuleSetupConfig } from '@open-mercato/shared/modules/setup'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    superadmin: ['service_requests.*'],
    admin: ['service_requests.*'],
    employee: ['service_requests.view', 'service_requests.manage'],
  },
}

export default setup
