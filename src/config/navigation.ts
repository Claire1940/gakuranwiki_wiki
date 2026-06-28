import {
	GraduationCap,
	Gamepad2,
	Swords,
	Map as MapIcon,
	Coins,
	Drama,
	Link2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'guide' -> t('nav.guide')
	path: string // URL 路径，如 '/guide'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// Gakuran 导航分类（与 content/ 文章目录、en.json nav/pages、DetailPage contentTypeLabels、sitemap 全程一致）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: GraduationCap, isContentType: true },
	{ key: 'controls', path: '/controls', icon: Gamepad2, isContentType: true },
	{ key: 'styles', path: '/styles', icon: Swords, isContentType: true },
	{ key: 'map', path: '/map', icon: MapIcon, isContentType: true },
	{ key: 'money', path: '/money', icon: Coins, isContentType: true },
	{ key: 'roleplay', path: '/roleplay', icon: Drama, isContentType: true },
	{ key: 'trello', path: '/trello', icon: Link2, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['guide', 'controls', 'styles', 'map', 'money', 'roleplay', 'trello']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
