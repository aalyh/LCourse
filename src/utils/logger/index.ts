import { Log, LogTypeConfigMap, TimingLog } from "./types"
import Queue from "@/dataStruct/queue";
import { ObserverMode } from "@/modes/Observer";
import { formatElapsedTime } from "../time";
import { type userInfo } from "@/store/modules/user";

/**
 * @description 模拟请求发送, 实际请求计划使用 navigator.sendBeacon
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
 * @param log 
 * @returns 
 */
function testReq(log: Log) {
    return new Promise((resolve) => {
        const randTime = (Math.random() * 10) * 100
        setTimeout(() => {
            console.log('发送日志: ', log)
            resolve(true)
        }, randTime)
    })
}

/**
 * @description 监控埋点工具类, 因为埋点的发送频率会随着需求迭代变得越来越高, 所以前端必须在设计之初就采用高并发控制
 * @todo 每个暴露的方法需要对传入的Log做埋点归类、去重等二次处理, 以削峰，给服务器降低压力 
 */
class XdLogger extends ObserverMode {
    // 请求发送池
    private logPool: Queue<Log>

    // 请求任务池
    private taskPool: Queue<Log>

    // 发送池规模限制
    private reqLimit: number

    // 请求状态控制器
    private requestLock: boolean

    // 定时器, 用于空闲时候及时消费任务队列
    private timer: NodeJS.Timeout | null

    private timingMap: Map<string, TimingLog>

    constructor(reqLimit: number) {
        super()
        this.reqLimit = reqLimit
        this.requestLock = false
        // 只对请求池代理, 用于自动消费
        this.logPool = new Queue()
        this.taskPool = new Queue()
        this.timingMap = new Map()
        this.timer = null
        this.initLogPoolObserver()
    }

    private initLogPoolObserver() {
        // 观察者响应操作
        super.addObserver({
            update: async () => {
                // 这里观察者模式只用于实现请求池消费完毕时, 自动检查并完成任务池的消费, 所以只需要关注这里
                while (this.taskPool.size()) {
                    const log = this.taskPool.deQueue()
                    const sendNum = this.taskPool.size() >= this.reqLimit ? this.reqLimit : this.taskPool.size()
                    for (let i = 0; i < sendNum; i++) {
                        log && this.logPool.enQueue(log)
                    }
                    console.log('任务队列填充中----------------------------------------------------------')
                    await this.sendLog()
                }
            }
        })
    }

    /**
     * @description 埋点请求发送底层逻辑, 采用分片削峰方式进行高并发请求控制
     * @param logData 
     */
    private async sendLog() {
        return new Promise(async (resolve) => {
            this.setRequestLock(true)
            do {
                const currentSize = this.logPool.size()
                const sendNum = currentSize < this.reqLimit ? currentSize : this.reqLimit
                const sendQueue: Promise<unknown>[] = []
                for (let i = 0; i < sendNum; i++) {
                    const log = this.logPool.deQueue()
                    // 发送方法具体采用 axios 还是 1*1 gif 或者是 Navigator.sendBeacon(), 看后人的选择
                    // 反正axios肯定是最不好的方案
                    log && sendQueue.push(testReq(log))
                }
                try {
                    await Promise.allSettled(sendQueue)
                } catch (e) {
                    console.log('埋点发送时遇到异常: ', e)
                }
            } while (this.logPool.size())
            console.log('本轮埋点发送完毕');
            this.setRequestLock(false)
            resolve(true)
        })
    }

    /**
     * @description 埋点任务添加调度器
     * @param logReq 
     */
    private dispatch(log: Log) {
        // 通过环境变量开启埋点开关, 这个等以后后端对应的微服务做好了再开, 前端先把调试走通

        // 关闭监控
        if (true) {
            return;
        }
        if (this.requestLock) {
            console.log('埋点请求发送中 ---------------- 填充任务队列');
            this.taskPool.enQueue(log)
        } else {
            this.logPool.enQueue(log)
            if (this.logPool.size() === this.reqLimit) {
                this.sendLog()
            }

            if (this.logPool.size() < this.reqLimit) {
                if (this.timer) {
                    this.timer = null
                }
                this.timer = setTimeout(() => {
                    if (this.timer) {
                        !this.requestLock && this.sendLog()
                        this.timer = null
                    }
                }, 500)
            }
        }
    }

    private setRequestLock(lockStatus: boolean) {
        this.requestLock = lockStatus
        if (!lockStatus) {
            // 当请求结束时, 触发观察者响应, 自动开始消费任务存量
            super.notifyObserver()
        }
    }

    // 事件埋点
    sendMethodsLog() {

    }

    // 浏览量埋点
    sendPvLog(pvLog: Log) {
        this.dispatch(pvLog)
    }

    // 曝光时长埋点开始记录
    recordPageEnter({ fullPath, pageName }: { fullPath: string, pageName: string }) {
        const enterTime = new Date().getTime()
        const TimingLog: TimingLog = {
            pageName,
            enterTime
        }
        this.timingMap.set(fullPath, TimingLog)
    }

    // 曝光时间埋点信息发送
    sendViewTimingLog(fullPath: string, userInfo: Partial<userInfo>) {
        const timingRecord = this.timingMap.get(fullPath)
        if (typeof timingRecord !== 'undefined') {
            const leaveTime = new Date().getTime()
            const showTimeLength = formatElapsedTime(leaveTime - timingRecord.enterTime)
            const LogValue = {
                showTimeLength,
                fullPath,
                pageName: timingRecord.pageName
            }
            const timingLog: Log = {
                type: 'timing',
                desc: LogTypeConfigMap['timing'],
                userInfo,
                time: new Date().toUTCString(),
                value: JSON.stringify(LogValue)
            }
            this.dispatch(timingLog)
        }
    }

    // 网站性能埋点发送顶层逻辑
    sendPerformanceLog(log: Log) {
        this.dispatch(log)
    }

    sendUvLog(log: Log) {
        this.dispatch(log)
    }

    // 一次展现过程里
    sendWaterFallLog() {

    }

    clear() {

    }
}

const logger = new XdLogger(5)

export default logger