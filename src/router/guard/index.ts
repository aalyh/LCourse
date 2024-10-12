import { Router } from "vue-router";
import createBaseRouterGuide from "./base";
import createPageLogRouterGuard from "./log";

function mountRouterGuard(router: Router) {
    createBaseRouterGuide(router)
    createPageLogRouterGuard(router)
}

export default mountRouterGuard