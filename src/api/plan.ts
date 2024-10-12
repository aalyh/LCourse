import request from "@/utils/http/request";
import { CateGoryScore, CourseCategoryType, ListResponseModel, pageParams } from "./types/public";
import { CompletePlanForm, PlanForm, PlanItem, ToCreatePlanItem } from "./types/user";

const enum API {
    TeacherPlan = '/curriculum/planning',
    userPlan = '/curriculum/planning'
}

export function getPlanListAPI(params: pageParams & { grade: string, type: CourseCategoryType }) {
    return request.get<ListResponseModel<PlanItem>>(API.TeacherPlan + '/page/front', params)
}

export function createPlanAPI(data: PlanForm) {
    return request.post(API.userPlan, data)
}

export function completePlanAPI(data: CompletePlanForm) {
    return request.post(API.userPlan + '/completion', data)
}

export function getToCreatePlanList() {
    return request.get<ToCreatePlanItem[]>(API.TeacherPlan)
}

/**
 * @description 获取学生本科期间, 各类二课的修读总分
 * @returns 
 */
export function getUserCateGoryScore() {
    // 接口没写好, 暂时写假数据
    return request.get<CateGoryScore[]>(API.TeacherPlan + '/grades')
}