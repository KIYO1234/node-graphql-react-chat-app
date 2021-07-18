import React, { useEffect } from 'react';
import { Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthDispatch, useAuthState } from '../../context/auth';
import { useMessageDispatch } from '../../context/message';
import Users from './Users';
import Messages from './Messages';
import { gql, useSubscription } from '@apollo/client';

const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid from to content createdAt
        }
    }
`

const Home = ({history}) => {
    const authDispatch = useAuthDispatch()
    const messageDispatch = useMessageDispatch()
    const { user } = useAuthState()

    const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE)

    useEffect(() => {
        if (messageError) console.log('messageError: ', messageError)
        
        if (messageData) {
            const message = messageData.newMessage
            const otherUser = user.username === message.to ? message.from : message.to

            messageDispatch({
                type: 'ADD_MESSAGE', payload: {
                    username: otherUser,
                    message,
                },
            })
        }
    }, [messageError, messageData])

    const logout = () => {
        authDispatch({ type: 'LOGOUT' })
        // history.pushだとリロードされないため、別のユーザーで再ログインしたときに前のユーザーのチャットが残ってしまう
        // history.push('/login')

        // 大元のパスを変えることでリロードを強制できる
        window.location.href = '/login'
    }

    return (
        <React.Fragment>
            <Row className="bg-white justify-content-around mb-1">
                <Col className='text-center'>
                    <Link to="/login">
                        <Button variant="link">Login</Button>
                    </Link>
                </Col>
                <Col className='text-center'>
                    <Link to="/register">
                        <Button variant="link">Register</Button>
                    </Link>
                </Col>
                <Col className='text-center'>
                    <Button variant="link" onClick={logout}>
                        Logout
                    </Button>
                </Col>
            </Row>

            <Row className="bg-white">
                <Users />
                <Messages />
            </Row>
        </React.Fragment>
    )
}

export default Home
