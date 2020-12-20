import React, {useEffect, useRef} from 'react';
import Message from "./Message";
import {breakpoint4} from "../../mixins";

const Chat = ({messages}) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if(window.innerWidth > breakpoint4)
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages]);

    return (
        <div>
            {messages.map((message, index)=> (
                <Message key={index} name={message.user} message={message.text} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default Chat;