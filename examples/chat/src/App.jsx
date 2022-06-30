import { useLayoutEffect, useRef } from 'react'

import { useChat } from './hooks/socketich'

import uniqolor from 'uniqolor'

function App () {
  const inputRef = useRef()
  const messagesRef = useRef()

  const { messages, sendMessage, client } = useChat('socketich-chat')

  useLayoutEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages.length])

  function send () {
    const message = inputRef.current.value

    sendMessage(message)

    inputRef.current.value = ''
  }

  function handleInputKeyDown (event) {
    if (event.key === 'Enter') {
      send()
    }
  }

  function handleButtonClick () {
    send()
  }

  return (
    <div className='bg-white p-5 sm:p-10 min-h-screen max-h-screen flex flex-col gap-4 max-w-md mx-auto'>
      <div><h1 className='text-2xl font-bold'>Socketich chat demo</h1></div>
      <div ref={messagesRef} className='flex-1 flex flex-col gap-4 overflow-auto pb-4'>
        {
          messages.map(({ message, name, userId: fromUserId }, index) => {
            const itsMe = fromUserId === client.userId
            const beforeSameUser = messages[index - 1]?.userId === fromUserId
            const { color, isLight } = uniqolor(fromUserId)

            return (
              <div className={`flex flex-col ${itsMe && 'items-end'}`} key={index}>
                <div className='card max-w-xs w-full p-0 text-sm shadow-md '>
                  <div className={`card-body py-3 px-4 ${itsMe ? 'bg-slate-300' : `bg-[${color}]`}`}>
                    {
                      !beforeSameUser && (
                        <h4 className={`card-title text-base ${!isLight ? 'text-white' : 'text-black'}`}>
                          {
                            itsMe
                              ? 'Me'
                              : (name || 'user-' + fromUserId.slice(0, 6))
                          }
                        </h4>
                      )
                    }
                    <p className={`${!isLight ? 'text-white' : 'text-black'}`}>{message}</p>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div className='flex gap-4'>
        <input ref={inputRef} type='text' placeholder='Say hi!' onKeyDown={handleInputKeyDown} className='input input-bordered input-primary w-full' />
        <button className='btn btn-primary' onClick={handleButtonClick}>Send</button>
      </div>
    </div>
  )
}

export default App
