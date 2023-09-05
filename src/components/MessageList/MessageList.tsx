import { MessageText } from '@/UI/MessageText/MessageText'
import s from './MessageList.module.css'
import { UserEmoji } from '@/UI/UserEmoji/UserEmoji'
import { UserName } from '@/UI/UserName/UserName'
import { Emoji } from '@/types/emojies'

interface PropsType {
	messages: { text: string; date: string }[]
	userName: string
	emoji: Emoji
}

export function MessageList({ messages }: PropsType) {
	return (
		<div className={s.message}>
			<div className={s.firstLine}>
				<UserEmoji emoji='emoji-1' />
				<UserName name='Alex' />
			</div>
			<div className={s.secondLine}>
				{messages.map(({ text, date }) => (
					<MessageText
						key={1}
						text={text}
						date={new Date(date).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})}
						isAuthor={false}
					/>
				))}
			</div>
		</div>
	)
}
