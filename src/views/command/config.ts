import { BaseProgressNode } from "@/components/progressBar/types"

export const starScoreTextMap = [
    { score: 0, text: '' },
    { score: 1, text: '平平淡淡' },
    { score: 2, text: '小有收获' },
    { score: 3, text: '收获颇丰' },
    { score: 4, text: '赞不绝口' },
    { score: 5, text: '下次还要来' }
]

export const tempCommentGoodNodes: BaseProgressNode[] = [
    { thresholdStep: 3, icon: 'tabler:coins', tip: '5' },
    { thresholdStep: 5, icon: 'tabler:coins', tip: '10' }
]