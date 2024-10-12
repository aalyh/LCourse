import { ListResponseModel, TombstoneGeneratedFields, pageParams } from "./types/public";
import request from "@/utils/http/request";

/**
 * @description 接收的维度评论项配置
 */
export interface DimensionCommentItem extends TombstoneGeneratedFields {
    name: string;
    description: string;
    icon: string;
    departmentId?: number | string;
}

/**
 * @description 发送的维度评论项内容
 */
export type SuggestionContentItem =
    Pick<DimensionCommentItem, 'name' | 'icon'>
    & { text: string, course_evaluate_id?: number, id: string, description?: string }


export type DimensionTopicItem = DimensionCommentItem

export interface DimensionDetailComment {
    dimension_Id: string
    dimension_name: string
    topics: (Pick<DimensionTopicItem, 'id' | 'name' | 'icon' | 'description'> & { text: string })[]
}
export type TopicCommentItem = Pick<SuggestionContentItem, 'id' | 'text' | 'icon' | 'name'>

export const corpuesTypeMap = {
    1: '词汇',
    2: '短语'
}
export interface CorpusItem extends TombstoneGeneratedFields {
    content: string
    type: keyof typeof corpuesTypeMap
    state: 0 | 1 // 0-弃用, 1-启用
}


const enum TopicApi {
    page = '/curriculum/dimensionality/topic/get',
    topicCorpusPage = '/curriculum/topic/word/get'
}

/**
 * 获取主题词汇
 * @param dimensionalityId 
 * @param params 
 * @returns 
 */
export function getDimensionTopic(dimensionalityId: number, params: pageParams & { state: number }) {
    return request.get<ListResponseModel<DimensionTopicItem>>(TopicApi.page + `/${dimensionalityId}`, params, {}, { cache: true })
}

/**
 * 获取主题词汇下的语料库
 * @param topicId 
 * @param params 
 * @returns 
 */
export function getTopicCorpus(topicId: string, params: pageParams & { state: number, type: keyof typeof corpuesTypeMap }) {
    return request.get<ListResponseModel<CorpusItem>>(TopicApi.topicCorpusPage + `/${topicId}`, params, {}, { cache: true })
}