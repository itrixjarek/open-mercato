export const metadata = {
  requireAuth: true,
  requireFeatures: ['service_requests.manage'],
  pageTitle: 'Nowe zgłoszenie',
  pageTitleKey: 'service_requests.create.title',
  pageGroup: 'Serwis',
  pageGroupKey: 'service_requests.nav.group',
  breadcrumb: [
    { label: 'Zgłoszenia serwisowe', labelKey: 'service_requests.page.title', href: '/backend/service-requests' },
    { label: 'Nowe zgłoszenie', labelKey: 'service_requests.create.title' },
  ],
}
