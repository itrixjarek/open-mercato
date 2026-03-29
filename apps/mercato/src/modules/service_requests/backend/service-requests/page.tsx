import { Page, PageBody } from '@open-mercato/ui/backend/Page'
import ServiceRequestsTable from '../../components/ServiceRequestsTable'

export default function ServiceRequestsPage() {
  return (
    <Page>
      <PageBody>
        <ServiceRequestsTable />
      </PageBody>
    </Page>
  )
}
