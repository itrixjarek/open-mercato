export const metadata = {
  requireAuth: true,
  requireFeatures: ['service_requests.manage'],
  pageTitle: 'Edytuj zgłoszenie',
  pageTitleKey: 'service_requests.edit.title',
  pageGroup: 'Serwis',
  pageGroupKey: 'service_requests.nav.group',
  breadcrumb: [
    { label: 'Zgłoszenia serwisowe', labelKey: 'service_requests.page.title', href: '/backend/service-requests' },
    { label: 'Edytuj', labelKey: 'service_requests.edit.title' },
  ],
}
