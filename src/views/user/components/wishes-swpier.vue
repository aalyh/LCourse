<script setup lang="ts">
import { MailToSelfItem } from '@/api/types/user';
import { getMailToSelfList } from '@/api/user/user'

const wishesList = ref<MailToSelfItem[]>()
const totalAll = ref(0)
const loadList = () => {
    getMailToSelfList({
        pageNum: 1,
        pageSize: 30
    }).then(({data}) => {
        const {list, total} = data
        wishesList.value = list
        totalAll.value = +total
    })
}

loadList()

</script>

<template>
    <div class="wish-swiper-container">
        <div class="top-bar">
            <span class="title">时光信箱<t-icon style="margin-left: 5px" icon="tabler:mailbox" /></span>
        </div>
        <van-swipe
            class="van-swipe"
            :autoplay="4000"
            :duration="1000"
            :lazy-render="true"
        >
            <van-swipe-item v-for="(wish, index) in wishesList" :key="index">
                <div class="swiper-item-content">
                    <div class="wish-label"><t-icon icon="tabler:clock-2" style="margin-right: 5px;" />{{ wish.gmtCreate?.slice(0, 16) }}</div>
                    <article>“ {{ wish.content }} ”</article>
                </div>
            </van-swipe-item>
            <template #indicator="{ active, total }">
                <div style="color: #a0a0a0">{{ active + 1 }}/{{ total }}</div>
            </template>
        </van-swipe>
    </div>
</template>

<style scoped lang="less">
.wish-swiper-container {
    margin: 20px 0;
    background-color: white;
    box-shadow: 0px 0px 16px -5px rgba(0,0,0,0.1); 
    border-radius: 15px;
    padding: 15px 30px;
    width: calc(100% - 60px);
    height: max-content;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    .top-bar {
        display: flex;
        align-items: flex-start;
        .title {
            font-weight: 600;
            font-size: 1.1em;
            display: flex;
            align-items: center;
        }
        margin-bottom: 30px;
    }
}
.van-swipe {
    width: 100%;
    .swiper-item-content {
        padding: 0 20px;
        margin: 0 auto;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        .wish-label {
            display: flex;
            align-items: center;
            text-align: left;
            font-weight: 600;
            margin-bottom: 15px;
        }
        article {
            height: 230px;
            display: -webkit-box;
            -webkit-line-clamp: 5; /* 限制在一个块元素显示的内容行数 */
            -webkit-box-orient: vertical; /* 设置或检索伸缩盒对象的子元素的排列方式 */
            overflow: hidden;
            text-indent: 2em;
            text-align: left;
            text-overflow: ellipsis;
            font-size: 30px;
            font-weight: 700;
            color: #a0a0a0;
        }
    }
}
</style>