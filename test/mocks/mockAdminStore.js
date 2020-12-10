import AdminStore from '../../public/js/app/stores/AdminStore'
import transformedAnalysisData from './transformedAnalysisData'
import transformedKoppsData from './transformedKoppsData'

const realAdminStore = new AdminStore()

const mockAdminStore = (userLang = 'en') => {
  const routerWithData = {
    ...realAdminStore,
    courseKoppsData: transformedKoppsData(userLang),
    analysisData: transformedAnalysisData,
    browserConfig: { storageUri: '' }
  }

  return routerWithData
}

export default mockAdminStore
