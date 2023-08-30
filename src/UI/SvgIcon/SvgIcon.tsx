import { HTMLAttributes } from 'react'
import s from './SvgIcon.module.css'

interface PropsType extends HTMLAttributes<SVGElement> {
	src: string
	name: string
	width?: number
	height?: number
	className?: string
}

export function SvgIcon({ src, name, width, className, height, ...props }: PropsType) {
	return (
		<svg width={width} height={height} className={[s.image, className].join(' ')} {...props}>
			<use xlinkHref={`/images/${src}#${name}`} />
		</svg>
	)
}
