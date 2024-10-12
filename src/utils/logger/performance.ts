/**
 * @link https://juejin.cn/post/6973567030528065573#heading-0
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Performance_API
 * @link https://github.com/forthealllight/blog/issues/38 这篇详细说明了SPA页面里performance使用的注意事项
 * @description performance 性能监控 参考资料
 */

/**
 * ---------------------------------------
 * 请注意:
 * 1、SPA页面里, url改变但不刷新页面, 无法触发performance.timing或者performance.getEntriesByType()重新获取数据
 *    所以SPA页面里, 需要采用其他方式获取路由刷新后的页面渲染性能数据
 * 2、performance.timing 在MDN里已经标注弃用, 所以这块数据稳妥起见还是用当前支持的方式去拿
 * ---------------------------------------
 */

class XdPerformance {
    // static observr: PerformanceObserver
    constructor() { }

    /**
     * @description 获取首屏渲染时间
     */
    getFP(): Promise<{ fp: string, fcp: string }> {
        return new Promise((resolve) => {
            const info = { fp: '', fcp: '', lcp: '' }
            const observer = new PerformanceObserver((entries) => {
                for (const entry of entries.getEntries()) {
                    if (entry.name === 'first-paint') {
                        info.fp = entry.startTime.toFixed(2)
                    } else if (entry.name === 'first-contentful-paint') {
                        info.fcp = entry.startTime.toFixed(2)
                    }
                }
                observer.disconnect()
                resolve(info)
            })
            observer.observe({ entryTypes: ['paint'] })
        })
    }

    /**
     * @description 获取首次渲染有意义内容时间, 这个有意义比较含糊, 大体可以认为是初始页面中尺寸占比较大，或者想要用户最快关注到的DOM
     * @param idName 
     * @returns 
     */
    getFMP(idName: string) {
        const start = new Date().getTime()
        let fmp = 0
        const targetNode = document.getElementById(idName) as HTMLElement
        return new Promise((resolve) => {
            const config: MutationObserverInit = { childList: true, subtree: true }
            const cb: MutationCallback = function (mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.addedNodes.length) {
                        const { clientHeight, clientWidth } = mutation.addedNodes[0] as HTMLElement
                        if (clientHeight && clientWidth) {
                            const end = new Date().getTime()
                            fmp = end - start
                            break
                        }
                    }
                }
                observer.disconnect()
                resolve(fmp)
            }
            const observer = new MutationObserver(cb)
            observer.observe(targetNode, config)
        })
    }

    /**
     * @description 获取最大渲染时间
     * @returns 
     */
    getLCP(): Promise<string> {
        return new Promise((resolve) => {

        })
    }

    /**
     * @description 获取白屏时间
     */
    getTTFB() {

    }
}

const xdPerformance = new XdPerformance()

export default xdPerformance