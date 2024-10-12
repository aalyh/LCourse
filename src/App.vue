<template>
  <div id="app">
    <div>
      <!-- 消息提醒框 -->
      <!-- <transition name="notify">
        <van-notice-bar
          scrollable
          v-show="isNotifyShow"
          :delay="1"
          style="
            position: fixed;
            top: 80px;
            z-index: 9999;
            width: 70%;
            margin-left: 12%;
            border-radius: 10px;
            border: 1px solid var(--van-notice-bar-text-color);
            height: 40px;
            background-color: white;
          "
          left-icon="volume-o"
          :text="notifyText"
          @replay="closeNotice"
        />
      </transition> -->

      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <keep-alive include="layOut">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
      <van-number-keyboard safe-area-inset-bottom />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useNotifyStore } from "@/store/modules/notify/index";
import { storeToRefs } from "pinia";
import useKeyBoardMonitor from '@/hooks/useKeyBoardMonitor'
import { registerFpLog } from "@/utils/logger/hooks";

// 首屏渲染埋点
registerFpLog()

let transitionName = ref("");
const router = useRouter();
const notifyStore = useNotifyStore();
const { isNotifyShow, notifyText, notifyScrollCnt, notifyScrollLimit } =
  storeToRefs(notifyStore);
function closeNotice() {
  if (notifyScrollCnt.value < notifyScrollLimit.value) {
    notifyScrollCnt.value++;
  } else {
    notifyStore.close();
  }
}

// 顶层监听软键盘弹起, 注入所有组件
// const {keyboardVisible} = useKeyBoardMonitor()
// provide('keyboardState', keyboardVisible)

router.beforeEach((to: any, from: any) => {
  // 一级页面进入二级页面
  if (from.meta.index <= to.meta.index) {
    transitionName.value = "slide-left";
  } else {
    //二级页面向上一个页面回退
    transitionName.value = "slide-right";
  }
});
</script>

<style lang="less">
body {
  display: block;
}

#app {
  padding: 0;
  --van-tabbar-height: 90px !important;
  .van-sticky--fixed {
    background-color: white;
    padding-top: 30px;
    padding-bottom: 20px;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.3s ease;
    position: absolute !important;
    background-color: white;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
    height: 100vh;
  }
  .slide-left-enter-from,
  .slide-right-leave-to {
    opacity: 1;
    transform: translateX(100%);
  }
  .slide-right-enter-from,
  .slide-left-leave-to {
    opacity: 0.5;
    transform: translateX(0%);
  }
  .slide-left-leave-to,
  .slide-right-leave-to {
    opacity: 0;
  }
  :deep(.van-notice-bar) {
  }
}
</style>
