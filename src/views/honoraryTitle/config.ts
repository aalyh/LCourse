export interface badgeItem {
    name: string;
    isGain: boolean;
    icon: string;
    minPoint: number,
    condition: string,
    activeColor: string;
    imgSrc?: string,
}

export const tempBadgeList: badgeItem[] = [
    { name: '初出茅庐', icon: 'tabler:hammer', isGain: false, minPoint: 0, condition: '新用户创建', activeColor: '#bda272' },
    { name: '勤劳笃志', icon: 'tabler:michelin-star-green', isGain: false, minPoint: 100, condition: '积分达到100', activeColor: '#29c224' },
    { name: '劳碌奋发', icon: 'tabler:navigation-up', isGain: false, minPoint: 200, condition: '积分达到200', activeColor: '#5099e7' },
    { name: '劳心者成', icon: 'tabler:pentagram', isGain: false, minPoint: 260, condition: '积分达到260', activeColor: '#23beb8' },
    { name: '劳动之星', icon: 'tabler:rosette-discount-check-filled', isGain: false, minPoint: 300, condition: '积分达到300', activeColor: '#f27e2c' }
]