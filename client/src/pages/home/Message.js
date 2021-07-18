import React from 'react'
import { useAuthState } from '../../context/auth'
import classNames from 'classnames'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import moment from 'moment'
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.extend(utc);

// console.log(dayjs.tz().format())


const Message = ({ message }) => {
    const { user } = useAuthState()
    console.log('user from useAuthState: ', user)
    
    const sent = message.from === user.username
    const received = !sent
    return (
        <OverlayTrigger
            placement={sent ? 'right' : 'left'}
            overlay={
                <Tooltip>
                    {moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
                </Tooltip>
            }
        >
            <div className={classNames("d-flex my-3", {
                'ml-auto flex-row-reverse': sent,
                'mr-auto': received,
            })}>
                <div className={classNames('py-2 px-3 rounded-pill', {
                    'bg-primary': sent,
                    'bg-secondary': received,
                })}>
                    <p
                        key={message.uuid}
                        className={classNames({ "text-white": sent })}
                    >{message.content}</p>
                </div>
            </div>
        </OverlayTrigger>
    )
}

export default Message
