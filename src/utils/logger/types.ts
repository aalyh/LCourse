import { CourseCategoryMap } from "@/api/types/public"

export const LogTypeConfigMap = {
    click: '点击事件',
    timing: '浏览时长',
    pv: '页面浏览',
    uv: '用户访问',
    fp: '首屏渲染时间',
    fcp: '首次有效内容渲染时间',
    lcp: '页面最大内容绘制时间',
    fmp: '首次有意义内容加载时间',
    ttfb: '白屏时间',
    waterfallLoad: '首页瀑布流数据加载'
}

export type LogType = keyof typeof LogTypeConfigMap

export interface Log {
    type: LogType
    value: string // 对象或者数组要转为JSON发
    userInfo: any
    desc: string
    time: string
}

export type LogRequest = (...args: any[]) => Promise<any>

export interface TimingLog {
    pageName: string
    enterTime: number
    leaveTime?: number
}

export interface WaterFallLogValue {
    category: keyof typeof CourseCategoryMap
    action: '下滑' | '查看更多'

}


export interface UvCacheStorage {
    expireTime: number
    history: string[]
}

/**
 * @description 待埋点事件的类型
 */
export interface OriginMethodsToLog<T = any> {
    [methodsName: string]: (...args: T[]) => any
}