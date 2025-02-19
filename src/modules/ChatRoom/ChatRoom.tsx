'use client'
import s from './ChatRoom.module.css'
import { ChatPageTemplate } from '@/components/ChatPageTemplate/ChatPageTemplate'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { Aside } from '@/UI/Aside/Aside'
import { fetchRooms } from '@/redux/slices/roomsSlice'
import { addMessage, setMessagesLoading, setMessages, Message } from '@/redux/slices/messagesSlice'
import { HeroSection } from '../HeroSection/HeroSection'
import { NotAuthorized } from '../PrivateChats/components/NotAuthorized/NotAuthorized'
import { apiBaseUrl } from '@/api/base'
import { Socket, io } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { setIsWritingData } from '@/redux/slices/isWritingSlice'
const roomsUrl = apiBaseUrl + 'rooms'

interface Props {
	roomId: string
}

export let roomsSocket: null | Socket = null

export const getSocket = ({ userId, roomId }: { userId: string; roomId: string }) => {
	console.log({ userId, roomId })
	const socket = io(roomsUrl, {
		query: {
			userId,
			roomId,
		},
		autoConnect: false,
	})

	return socket
}

export function ChatRoom({ roomId }: Props) {
	const rooms = useAppSelector(state => state.rooms.rooms)
	const userId = useAppSelector(state => state.user.userId)

	const dispatch = useAppDispatch()

	useEffect(() => {
		if (rooms.length === 0) {
			dispatch(fetchRooms())
		}
	}, [dispatch, rooms.length])

	const router = useRouter()

	useEffect(() => {
		const handleReceiveMessage = (message: Message) => {
			dispatch(addMessage(message))
		}

		const handleStartWrite = (data: { userName: string }) => {
			dispatch(setIsWritingData({ isWriting: true, userName: data.userName }))
		}
		const handleEndWrite = () => {
			dispatch(setIsWritingData({ isWriting: false, userName: null }))
		}

		if (userId) {
			dispatch(setMessagesLoading(true))
			roomsSocket = getSocket({ userId, roomId })
			roomsSocket.connect()

			roomsSocket.on('error', () => {
				router.push('/404')
				return null
			})

			roomsSocket.on('history', (data: any) => {
				const newMessages: Message[] = data.messages.map(
					(message: { chatId: any; text: any; user: any; createdAt: any }) => ({
						chatId: message.chatId,
						text: message.text,
						user: message.user,
						createdAt: message.createdAt,
					}),
				)
				dispatch(setMessages(newMessages))
				dispatch(setMessagesLoading(false))
			})
			roomsSocket.on('user-start-write', handleStartWrite)
			roomsSocket.on('user-end-write', handleEndWrite)

			roomsSocket.on('message', handleReceiveMessage)
		}

		return () => {
			roomsSocket?.off('message', handleReceiveMessage)
			roomsSocket?.off('user-start-write', handleStartWrite)
			roomsSocket?.off('user-end-write', handleEndWrite)
			roomsSocket?.disconnect()
		}
	}, [userId, roomId, dispatch, router])

	if (!userId) {
		return (
			<div className={s.wrapper}>
				<div className={s.mainContainer}>
					<HeroSection infoBlock />
					<NotAuthorized />
				</div>
			</div>
		)
	}

	return (
		<div className={s.wrapper}>
			<div className={s.mainContainer}>
				<div className={s.contentWrapper}>
					<Aside rooms={rooms} />
					<ChatPageTemplate roomId={roomId} />
				</div>
			</div>
		</div>
	)
	// return isValidId ? (
	// ) : (
	// <div style={{ margin: 'auto' }}>
	// 	<Loader />
	// </div>
	// )
}
