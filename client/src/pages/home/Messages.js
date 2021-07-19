import React, { useEffect, useState } from 'react'
import { Col, Form } from 'react-bootstrap'
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useMessageDispatch, useMessageState } from '../../context/message';
import Message from './Message'

const SEND_MESSAGE = gql`
    mutation sendMessage($to: String!, $content: String!){
        sendMessage(to: $to, content: $content){
            uuid from to content createdAt
        }
    }
`

const GET_MESSAGES = gql`
    query getMessages($from: String!){
        getMessages(from: $from){
            uuid from to content createdAt
            reactions{
                uuid content
            }
        }
    }
`
const Messages = () => {
    const { users } = useMessageState()
    const dispatch = useMessageDispatch()
    const [content, setContent] = useState('')
    const selectedUser = users?.find(u => u.selected === true)
    // console.log('selectedUser: ', selectedUser)
    
    const messages = selectedUser?.messages
    console.log('messages: ', messages)
    

    const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES)
    

    const [sendMessage] = useMutation(SEND_MESSAGE, {            
        onError: err => console.log(err)   
    })

    useEffect(() => {
        if (selectedUser && !selectedUser.messages) {
            console.log('selectedUser', selectedUser)
            // queryの引数に何かを渡すときにはvariables optionを渡す
            // variables: GraphQL queryに渡したい全ての変数を含むオブジェクト
            getMessages({ variables: { from: selectedUser.username }})
        }
    }, [selectedUser])

    useEffect(() => {
        if (messagesData) {
            dispatch({ type: 'SET_USER_MESSAGES', payload: {
                    username: selectedUser.username,
                    messages: messagesData.getMessages
            }})
        }
    }, [messagesData])

    if (messagesData) console.log('messagesData.getMessages: ', messagesData.getMessages)

    const submitMessage = e => {
        e.preventDefault()
        if (content.trim() === '' || !selectedUser) return
        setContent('')

        // mutation for sending the message
        sendMessage({ variables: { to: selectedUser.username, content }})
    }

    let selectedChatMarkup
    if (!messages && !messagesLoading) {
        selectedChatMarkup = <p className="info-text">Select a friend</p>
    } else if (messagesLoading) {
        selectedChatMarkup = <p>Loading...</p>
    } else if (messages.length > 0) {
        selectedChatMarkup = messages.map((message, index) => (
            <React.Fragment key={message.uuid}>
                <Message key={message.uuid} message={message} />
                {index === messages.length - 1 && (
                    <div className="invisible">
                        <hr className="mr-0" />
                    </div>
                )}
            </React.Fragment>
        ))
    } else if (messages.length === 0) {
        selectedChatMarkup = <div className="first-message">You are now connected! Send your first message!</div>
    }

    return (
        <Col xs={10} md={8}>
            <div
                style={{overflowY: 'scroll', height: 500, scrollbarWidth: 'none', display: 'flex', justifyContent: 'end', flexDirection: 'column-reverse'}}
            >
                {selectedChatMarkup}
            </div>
            <div>
                <Form
                    onSubmit={submitMessage}
                >
                    <Form.Group className="d-flex align-items-center mb-3">
                        <Form.Control
                            type="text"
                            className="message-input rounded-pill bg-secondary border-0"
                            style={{marginRight: 30}}
                            placeholder='Type a message'
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        <i
                            className="fas fa-paper-plane fa-2x text-primary"
                            style={{marginRight: 7, cursor: 'pointer'}}
                            onClick={submitMessage}
                        ></i>
                    </Form.Group>
                </Form>
            </div>
        </Col>
    )
}

export default Messages
