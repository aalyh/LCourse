<script setup lang="ts">
/**
 * @description 底层基础进度条, 主要用于分阶段ICON显示
 */
import type {BaseProgressBarProps} from './types'

type Props = BaseProgressBarProps

const props = withDefaults(defineProps<Props>(), {
    trackColor: '#f2f2f2',
    barColor: '#f3a645'
})


</script>

<template>
    <div class="base-progress-container">
        <div class="base-progress-main">
            <div class="base-progress-node-list">
                <div 
                    v-for="(node, index) in props.nodes"
                    :key="index"
                    class="base-progress-node"
                    :style="{
                        left: `calc((100vw - 60px) * ${(node.thresholdStep / props.totalSteps).toFixed(2)})`    
                    }"
                >
                    <slot name="node" :node="node">
                        <div
                            class="default-node"
                            :style="{
                                color: props.currentStep >= node.thresholdStep ? '#f37700' : '#b6b6b6' 
                            }"
                        >
                            <!--imgSrc的适配后面做, 现在暂时没这需求, 需要了加个条件渲染就行-->
                            <t-icon class="node-icon" :icon="node.icon" />
                            <span class="node-tip">{{ node.tip }}</span>
                        </div>
                    </slot>
                </div>
            </div>
            <div
                class="base-progress-track"
                :style="{
                    backgroundColor: props.trackColor
                }"
            >
                <span
                    class="base-progress-active-bar" 
                    :style="{
                        backgroundColor: props.barColor,
                        transform: `translateX(${+(props.currentStep / props.totalSteps).toFixed(3) * 100}%)`
                    }"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.base-progress-container {
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    background-color: transparent;
    
    .base-progress-main {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: calc(100% - 60px);
        height: auto;
        padding: 10px 0px;
        margin: 0 auto;

        .base-progress-node-list {
            width: 100%;
            height: 60px;
            display: flex;
            align-items: center;
            flex-direction: row;
            .base-progress-node {
                position: absolute;
                width: 100px;
                height: 60px;
                .default-node {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    .node-icon {
                        font-size: 35px;
                    }
                    .node-tip {
                        font-size: 20px;
                    }
                }
            }
        }
        .base-progress-track {
            margin-top: 15px;
            width: 100%;
            height: 10px;
            border-radius: 15px;
            overflow-x: hidden;
            position: relative;
        }
        .base-progress-active-bar {
            position: absolute;
            width: calc(100vw - 60px);
            height: 10px;
            right: calc(100vw - 60px);
            transition: transform .2s ease;
        }
    }
}
</style>