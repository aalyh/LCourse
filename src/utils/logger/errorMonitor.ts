import xdLogger from './index'

export function registerJSErrorMonitor() {
    window.addEventListener('error', function (e) {
        console.log('js error: ', e)
    })
}

export function registerSourceErrorMonitro() {

}