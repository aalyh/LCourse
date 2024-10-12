import XdLogger from './index'
import { useUserStore } from '@/store/modules/user'
import { LogTypeConfigMap, type Log, UvCacheStorage, OriginMethodsToLog } from './types'
import { useRouterCacheStore } from '@/store/modules/routerCache'
import { storeToRefs } from 'pinia'
import xdPerformance from './performance'
import { generateQueryString } from '../common/object'

/**
 * @description 曝光时长埋点
 */
export function registerTimingLog() {
    const route = useRoute()
    const { fullPath, meta, name } = route
    const userStore = useUserStore()
    const { cache: routerCache } = storeToRefs(useRouterCacheStore())

    /**
     *  --------------------- 其他逻辑
     */

    onActivated(() => {
        XdLogger.recordPageEnter({ fullPath, pageName: meta.title })
    })

    onDeactivated(() => {
        const userInfo = {
            userId: userStore.userId
        }
        XdLogger.sendViewTimingLog(fullPath, userInfo)
    })

    onMounted(() => {
        XdLogger.recordPageEnter({ fullPath, pageName: meta.title })
    })

    onUnmounted(() => {
        // 被缓存的页面不走onUnmounted
        if (routerCache.value.includes(name!)) {
            return
        }
        const userInfo = {
            userId: userStore.userId
        }
        XdLogger.sendViewTimingLog(fullPath, userInfo)
    })
}

/**
 * @description PV-页面浏览量埋点, 注册位置在路由守卫中
 * @param route 
 */
export function registerPVLog({ fullPath, pageName }: Record<string, string>) {
    const userStore = useUserStore()

    const logValueDetail = {
        fullPath,
        pageName
    }
    const logValue: Log = {
        type: 'pv',
        userInfo: {
            userId: userStore.userId
        },
        time: new Date().toUTCString(),
        desc: LogTypeConfigMap['pv'],
        value: JSON.stringify(logValueDetail)
    }

    XdLogger.sendPvLog(logValue)
}

/**
 * @description UV-埋点, 注册在路由守卫中
 * @param param0 
 * @returns 
 */
export function registerUvLog({ fullPath, pageName }: Record<string, string>) {
    const storage = localStorage.getItem('uvCache')
    let initialUvCache: UvCacheStorage = {
        expireTime: new Date().getTime() + 24 * 60 * 60 * 1000,  // 一个uv记录周期是一天
        history: [fullPath]
    }
    const now = new Date().getTime()

    if (storage) {
        const uvStorage = JSON.parse(storage) as UvCacheStorage
        const { history, expireTime } = uvStorage
        if (expireTime <= now) {
            // 周期已过, 更新周期,
            localStorage.removeItem('uvCache')
            localStorage.setItem('uvCache', JSON.stringify(initialUvCache))
        } else {
            if (history.includes(fullPath)) {
                // 已访问过就不算
                return
            } else {
                // 未访问过才算一次uv, 先更新缓存
                uvStorage.history.push(fullPath)
                localStorage.setItem('uvCache', JSON.stringify(uvStorage))
            }
        }
    } else {
        localStorage.setItem('uvCache', JSON.stringify(initialUvCache))
    }

    const uvLogValueDetail = {
        fullPath,
        pageName
    }

    const userStore = useUserStore()
    const uvLogInfo: Log = {
        type: 'uv',
        desc: LogTypeConfigMap['uv'],
        userInfo: {
            userId: userStore.userId
        },
        time: new Date().toUTCString(),
        value: JSON.stringify(uvLogValueDetail)
    }

    XdLogger.sendUvLog(uvLogInfo)
}

/**
 * @description 瀑布流打点, 暂时不知道需要收集些什么信息
 */
export function registerWaterFallLog({ category }) {
    // todo
    XdLogger.sendWaterFallLog()
}

/**
 * @description 首屏渲染fp、fcp打点
 */
export function registerFpLog() {
    xdPerformance.getFP()
        .then(({ fp, fcp }) => {
            const { hash } = location
            const fullPath = hash.split('#')[1]
            const fpLogValueDetail = {
                fullPath,
                fp: fp + 'ms'
            }
            const fcpLogValueDetail = {
                fullPath,
                fp: fcp + 'ms'
            }
            const FpLogInfo: Log = {
                type: 'fp',
                desc: LogTypeConfigMap['fp'],
                userInfo: {},
                time: new Date().toUTCString(),
                value: JSON.stringify(fpLogValueDetail)
            }

            const FcpLogInfo: Log = {
                type: 'fcp',
                desc: LogTypeConfigMap['fcp'],
                userInfo: {},
                time: new Date().toUTCString(),
                value: JSON.stringify(fcpLogValueDetail)
            }

            XdLogger.sendPerformanceLog(FpLogInfo)
            XdLogger.sendPerformanceLog(FcpLogInfo)
        })
}

/**
 * @description fmp跟业务耦合度高，需要单独拿出来封装
 * @param {string} idName 认定为首次渲染有意义的DOM的id名
 */
export function registerFmpLog(idName: string) {
    onMounted(() => {
        const route = useRoute()
        const { fullPath, meta } = route
        xdPerformance.getFMP(idName)
            .then((fmp) => {
                const fmpLogValueDetail = {
                    fullPath,
                    name: meta.title,
                    fmp: fmp + 'ms'
                }

                const FmpLogInfo: Log = {
                    type: 'fmp',
                    desc: LogTypeConfigMap['fmp'],
                    userInfo: {},
                    time: new Date().toUTCString(),
                    value: JSON.stringify(fmpLogValueDetail)
                }
                XdLogger.sendPerformanceLog(FmpLogInfo)
            })
    })
}


export function registerTtfbLog() {

}

/**
 * @description 最大内容获取时间
 */
export function registerLcpLog() {
    // const route = useRoute()
    // const { fullPath, meta } = route
    // xdPerformance.getLCP()
    //     .then((lcp) => {
    //         const lcpLogValueDetail = {
    //             fullPath,
    //             name: meta.title,
    //             lcp: lcp + 'ms'
    //         }

    //         const FmpLogInfo: Log = {
    //             type: 'lcp',
    //             desc: LogTypeConfigMap['lcp'],
    //             userInfo: {},
    //             value: JSON.stringify(lcpLogValueDetail)
    //         }
    //         XdLogger.sendPerformanceLog(FmpLogInfo)
    //     })
}

/**
 * @description 给方法的统一埋点逻辑
 * @param originMethods 需要打点的源方法对象
 * @returns 代理后的自动打点方法
 */
export function registerMethodsLog(originMethods: OriginMethodsToLog) {
    const methodsLogged: OriginMethodsToLog = {}
    const userStore = useUserStore()
    const { userId } = userStore
    const route = useRoute()
    const { fullPath, query = {} } = route
    const pageKey = fullPath + generateQueryString(query)
    Object.keys(originMethods).forEach((fnName) => {
        const fnLogged = new Proxy(originMethods[fnName], {
            get: function (target, _, value) {
                // toLogged methods
                console.log('target: ', target, '\nvalue: ', value)
                // todo: 记录方法触发的时间
                const activeTime = new Date().toUTCString()
                const logValueDetail = {
                    pageKey,

                }
                // ....
                return
            }
        })
        methodsLogged[`${fnName}Logged`] = fnLogged
    })
    return methodsLogged
}