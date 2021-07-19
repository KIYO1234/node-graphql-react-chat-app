import React, { useState } from 'react'
import { useAuthState } from '../../context/auth'
import { gql, useMutation } from '@apollo/client'
import classNames from 'classnames'
import { Button, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'
import moment from 'moment'
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.extend(utc);

// console.log(dayjs.tz().format())
const reactions = ['❤️', '😄', '😯', '😢', '😡', '👍', '👎']

const REACT_TO_MESSAGE = gql`
    mutation reactToMessage($uuid: String! $content: String!){
        reactToMessage(uuid: $uuid, content: $content){
            uuid
        }
    }
`

const Message = ({ message }) => {
    const { user } = useAuthState()
    console.log('user from useAuthState: ', user)
    
    const sent = message.from === user.username
    const received = !sent
    const [showPopover, setShowPopover] = useState(false)

    const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
        onError: err => console.log(err),
        onCompleted: (data) => {
            console.log('reactToMessage data: ', data)
            setShowPopover(false)
        }
        
    })

    const react = (reaction) => {
        reactToMessage({ variables: { uuid: message.uuid, content: reaction }})
    }

    const reactButton =
        <OverlayTrigger
            trigger="click"
            placement="top"
            show={showPopover}
            onToggle={setShowPopover}
            transition={false}
            rootClose
            overlay={
                <Popover
                    className="rounded-pill"
                >
                    <Popover.Content
                        className="
                        react-button-popover
                        d-flex
                        align-items-center
                        px-0
                        py-1
                        "
                    >
                        {reactions.map(reaction => (
                            <Button
                                variant="link"
                                key={reaction}
                                onClick={() => react(reaction)}
                                className="react-icon-button"
                            >
                                {reaction}
                            </Button>
                        ))}
                    </Popover.Content>
                </Popover>
            }
        >
            <Button variant="link" className="px-2">
                <i className="far fa-smile"></i>
            </Button>
        </OverlayTrigger>

    return (
        <div className={classNames("d-flex my-3", {
            'ml-auto flex-row-reverse': sent,
            'mr-auto': received,
        })}>
            <OverlayTrigger
                placement={sent ? 'right' : 'left'}
                overlay={
                    <Tooltip>
                        {moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
                    </Tooltip>
                }
            >
                <div className={classNames('py-2 px-3 rounded-pill', {
                    'bg-primary': sent,
                    'bg-secondary': received,
                })}>
                    {/* {message.reactions.length > 0 && (
                        <div className="bg-secondary p-1 rounded-pill">
                            {message.reactions.map((r) => r.content)}
                        </div>
                    )} */}
                    <p
                        key={message.uuid}
                        className={classNames({ "text-white": sent })}
                    >{message.content}</p>
                </div>
            </OverlayTrigger>
            {reactButton}
        </div>
    )
}

export default Message
