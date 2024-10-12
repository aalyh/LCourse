import xdPerformance from '@/utils/logger/performance'
import { registerPVLog, registerUvLog } from '@/utils/logger/hooks'
import XdLogger from '@/utils/logger/index'
import { type Router } from 'vue-router'

function createPageLogRouterGuard(router: Router) {

    router.beforeEach((_, __, next) => {
        async () => XdLogger.sendMethodsLog()
        next()
    })

    router.afterEach((to, __) => {
        const { fullPath, meta } = to
        registerPVLog({
            fullPath,
            pageName: meta.title
        })
        registerUvLog({
            fullPath,
            pageName: meta.title
        })
    })
}

export default createPageLogRouterGuard