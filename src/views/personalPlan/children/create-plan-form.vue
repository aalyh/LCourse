<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { createPlanAPI } from '@/api/plan'
import { ToCreatePlanItem, PlanState } from '@/api/types/user';
import { useUserStore } from '@/store/modules/user';
import useLoading from '@/hooks/useLoading';

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const createInfo = route.query as ToCreatePlanItem
const customPageBack = () => {
    showConfirmDialog({
        title: "退出",
        message: "当前计划还未创建, 会影响额外积分获取, 确定要退出吗?",
    }).then(() => {
        router.push({path: '/personalPlan/userPlanList'})
    })
}

const currentCategory = computed(() => {
    return userStore.cateGoryScore.find(item => item.name === createInfo.type)
})
const targetScore = ref(
    20 - currentCategory.value?.value > createInfo.fixRestrictions ? createInfo.fixRestrictions : 20 - currentCategory.value?.value
)
const decreaseScore = () => {
    if (targetScore.value <= createInfo.fixRestrictions) {
        showFailToast('个人目标不能低于最低要求')
        return;
    }
    targetScore.value--
}
const increaseScore = () => {
    targetScore.value++
}

const {loading: submitLoading, setLoading: setSubmitLoading} = useLoading(false)
const submit = () => {
    if (!targetScore.value) {
        showFailToast('请先设置目标分数')
        return;
    }
    showConfirmDialog({
        title: "创建计划",
        message: "创建后无法更改,",
    })
    .then(() => {
        setSubmitLoading(true)
        createPlanAPI({
            targetScore: targetScore.value,
            objectivesId: +createInfo.id,
            state: PlanState.ing,
            uid: userStore.userId as string
        })
        .then(() => {
            setSubmitLoading(false)
            showSuccessToast({
                message: '创建成功',
                duration: 700
            })
            setTimeout(() => {
                router.push({path: '/personalPlan/userPlanList'})
            }, 700)
        })
        .catch(() => {
            setSubmitLoading(false)
        })
    })
    .catch(() => {
      // on cancel
    });
}

</script>

<template>
    <div class="create-plan-form-container">
        <XdHeader title="学年新规划" :custom-back="customPageBack" />
        <main>
            <!--UI靠后人的智慧了-->
            <ul class="plan-form-info">
                <li class="plan-title">{{ createInfo.objectivesName }}</li>
                <li class="plan-type">{{ createInfo.type || '暂未设置' }}</li>
                <li class="plan-area">
                    <div class="department-tag">
                        <t-icon class="icon" icon="tabler:building-community" /> <span>{{ createInfo.departmentName }}</span>
                    </div>
                    <div class="major-tag">
                        <t-icon class="icon" icon="tabler:notebook" /> <span>{{ createInfo.majorName }}</span>
                    </div>
                </li>
                <li class="plan-current-progress">
                    <span>该分类当前达标进度</span>
                    <van-progress 
                        :stroke-width="10"
                        :pivot-text="currentCategory?.value+'分'"
                        :percentage="(+(currentCategory?.value / 20).toFixed(2) * 100)"
                    />
                </li>
                <li class="plan-type">本学年最低修读要求: {{ createInfo.fixRestrictions }}学分</li>
                <li class="plan-target">
                    <span>本学年学分修读目标</span>
                    <div>
                        <t-icon
                            class="control-icon minus-icon" 
                            icon="tabler:square-rounded-minus-filled" 
                            :color="targetScore <= createInfo.fixRestrictions ? '#b2b2b2' : 'black'"
                            @click="decreaseScore"
                            />
                        <div class="target-score">
                            {{ targetScore }}
                        </div>
                        <t-icon
                            class="control-icon plus-icon" 
                            icon="tabler:square-rounded-plus-filled"
                            @click="increaseScore"
                        />
                    </div>
                </li>
                <li class="tip">个人目标高于最低要求时, 完成计划将会获得额外积分奖励</li>
            </ul>
        </main>
        <section class="form-btn-group">
            <div class="quit-btn" @click="customPageBack">退出</div>
            <div
                class="submit-btn"
                :style="{
                    backgroundColor: targetScore ? '#ffac40' : '#ffd9a9'
                }"
                @click="submit"
            >
                创建
            </div>
        </section>
        <van-toast v-model:show="submitLoading" type="loading" message="提交中" />
    </div>
</template>

<style scoped lang="less">
.create-plan-form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100vh;
    width: 100vw;
}
main {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    .plan-form-info{
        margin-top: 80px;
        width: 90%;
        min-height: 600px;
        .plan-title {
            width: 100%;
            text-overflow: ellipsis;
            font-size: 50px;
            font-weight: bold;
        }
        .plan-type {
            margin-top: 40px;
            font-size: 35px;
            font-weight: bold;
            color: rgb(170, 170, 170);
        }
        .plan-area {
            display: flex;
            align-items: center;
            width: max-content;
            margin: 50px auto 100px;
            &>div {
                .icon {
                    margin-right: 5px;
                    font-size: 1.2em;
                }
                span {
                    font-weight: 800;
                    font-size: 1em;
                }
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: space-around;
                padding: 5px 10px;
                border-radius: 10px;
            }
            .department-tag {
                background-color: rgb(255,243,232);
                color: rgb(247,114,52);
                margin-right: 15px;
            }
            .major-tag {
                background-color: rgb(245,232,255);
                color: rgb(114,46,209);
                margin-left: 15px;
            }
        }
        .plan-current-progress {
            display: flex;
            align-items: center;
            flex-direction: column;
            margin-bottom: 60px;
            span {
                margin-bottom: 30px;
                font-size: 30px;
                font-weight: bold;
                color: rgb(170, 170, 170);
            }
        }
        .plan-target {
            margin: 120px auto 0;
            display: flex;
            width: 80%;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            span {
                margin-bottom: 30px;
                font-size: 40px;
                font-weight: bold;
                color: rgb(95, 95, 95); 
            }
            div {
                width: max-content;
                display: flex;
                align-items: center;
                justify-content: space-around;
                .target-score {
                    font-size: 100px;
                    width: 200px;
                    aspect-ratio: 1/1;
                }
                .control-icon {
                    font-size: 80px;
                }
            }
        }
        .tip {
            margin: 0 auto;
            width: 70%;
            font-size: 25px;
            color: rgb(194, 194, 194);
        }
    }
}
.form-btn-group {
    width: 80%;
    height: auto;
    position: fixed;
    bottom: 50px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    div {
        width: 260px;
        height: 80px;
        border-radius: 15px;
        font-size: 30px;
        letter-spacing: 5px;
        font-weight: bold;
        border: 3px solid #ffac40;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .quit-btn {
        color: #ffac40;
    }
    &>.submit-btn {
        color: white;
        border-color: transparent;
    }
}
:deep(.van-progress) {
    width: 80%;
}
</style>