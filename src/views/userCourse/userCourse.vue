<template>
  <div class="my-courses-container">
    <XdHeader title="我的课程" />
    <van-dropdown-menu active-color="#e1562a">
      <van-dropdown-item v-model="state" :options="option" />
    </van-dropdown-menu>
    <div class="list-container">
      <UserCourseWaterFall
        :request-api="getCourses"
        :other-request-params="otherParams" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCourses } from "@/api/courses/courses";
import { CourseStateEnum, courseStateMap } from "@/api/types/public";

defineOptions({
  name: 'userCourse'
})

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const UserCourseWaterFall = defineAsyncComponent(() => import('@/components/waterFall/index.vue'))
const option = Object.entries(courseStateMap).map(([value, {label:text}]) => ({text, value: +value}))
const state = ref(CourseStateEnum.all);

const otherParams = ref({
    userType: 1,
    state: state.value,
    passType: state.value >= 3 ? 1 : null
})

watch(
  () => state.value,
  (newVal) => {
    otherParams.value.state = newVal
    otherParams.value.passType = newVal >= 3 ? 1 : null
  }
)
</script>

<style scoped lang="less">
.my-courses-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  .list-container {
    width: 96%;
    padding-top: 10px;
    flex: 1;
    overflow-y: auto;
  }
}
:deep(.van-dropdown-menu__bar) {
  width: 100vw;
  height: calc(var(--van-dropdown-menu-height) * 0.7);
  background-color: white;
}
:deep(.van-dropdown-item__option) {
  padding: 15px 30px;
}
</style>
