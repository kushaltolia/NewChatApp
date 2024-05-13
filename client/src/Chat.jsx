import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar';
import { set } from 'mongoose';
import axios from 'axios';

function Chat() {
    if(localStorage.getItem('userData') === null) {
        return (
            <div>
                <Link to = {"/"}><h1 className = 'text-center text-2xl mt-20'>Please Signin</h1></Link>
            </div>
        )
    } else {
        const [websocket, setWebsocket] = useState(null);
        const [onlinePeople, setOnlinePeople] = useState({});
        const [offlinePeople, setOfflinePeople] = useState([]);
        const [selectedUserId, setSelectedUserId] = useState(null);
        const [newMessageText, setNewMessageText] = useState('');
        const [mesages, setMessages] = useState([]);
        const loggedinUsername = JSON.parse(localStorage.getItem('userData')).username;
        const loggedinUserId = JSON.parse(localStorage.getItem('userData')).id;
        useEffect(() => {
            const newWebsocket = new WebSocket('ws://localhost:4000');
            setWebsocket(newWebsocket);
            newWebsocket.addEventListener('message', handleMessage);
        }, [])
        useEffect(() => {
            axios.get(`http://localhost:4000/message/${selectedUserId}`).then((res) => {
                setMessages(res.data);
                console.log(res.data);
            })
        }, [selectedUserId])
        useEffect(() => {
            axios.get('http://localhost:4000/people').then(res => {
                const allPeople = res.data;
                console.log("All people are : ", allPeople);
                const offlinePeopleArray = allPeople.filter(person => !onlinePeople[person._id]);
                console.log("Offline people are : ", offlinePeopleArray);
                setOfflinePeople(offlinePeopleArray);
            })
        }, [onlinePeople])
        function showPeopleOnline(peopleArray) {
            const people = {};
            peopleArray.forEach(({userId, username}) => {
                people[userId] = username;
            })
            setOnlinePeople(people);
            console.log(people);
        }
        function selectContact(userId) {
            setSelectedUserId(userId);
        }
        function handleMessage(event) {
            const messageData = JSON.parse(event.data);

             console.log("Event data is : " + event.data)
             if('online' in messageData) {
                showPeopleOnline(messageData.online);
             } else {
                setMessages(prev => ([...prev, messageData]));
             }
        }
        function sendMessage() {
            websocket.send(JSON.stringify({
                    recipient : selectedUserId,
                    sender : loggedinUserId,
                    text : newMessageText
            }))
            setMessages(prev => ([...prev, {
                recipient : selectedUserId,
                sender : loggedinUserId,
                text : newMessageText
        }]));
            setNewMessageText('');
        }
        return (
            <div className = 'flex h-screen'>
                <div className = 'bg-white w-1/3'>
                    <div className = 'text-blue-600 font-bold flex gap-2 p-4'>MernChat</div>
                    {Object.keys(onlinePeople).map(userId => {
                        if(loggedinUsername !== onlinePeople[userId]) {
                            return (
                                <div onClick = {() => selectContact(userId)} key = {userId} className = {'border-b border-gray-100 flex items-center gap-2 cursor-pointer ' + (selectedUserId === userId ? "bg-blue-50" : "" )}>
                                {userId === selectedUserId && <div className = 'w-1 bg-blue-500 h-12'/> }
                                <div className = 'flex gap-2 py-2 pl-4 items-center'>
                                    <Avatar userId = {userId} username = {onlinePeople[userId]} online = {true} />
                                    <span>{onlinePeople[userId]}</span>
                                </div>
                            </div>
                            )
                        }
                })}
                {(offlinePeople).map(offPerson => {
                        if(loggedinUsername !== offPerson._id) {
                            return (
                                <div onClick = {() => selectContact(offPerson._id)} key = {offPerson._id} className = {'border-b border-gray-100 flex items-center gap-2 cursor-pointer ' + (selectedUserId === offPerson._id ? "bg-blue-50" : "" )}>
                                {offPerson._id === selectedUserId && <div className = 'w-1 bg-blue-500 h-12'/> }
                                <div className = 'flex gap-2 py-2 pl-4 items-center'>
                                    <Avatar userId = {offPerson._id} username = {offPerson.username} online = {false} />
                                    <span>{offPerson.username}</span>
                                </div>
                            </div>
                            )
                        }
                })}
                </div>
                <div className = 'bg-blue-50 w-2/3 p-2 flex flex-col'>
                    <div className = 'flex-grow'>
                        {!selectedUserId && <div className = 'flex h-full flex-grow items-center justify-center'><div className = 'text-gray-400'>Select a person to Chat</div></div>}
                    </div>
                    {selectedUserId && <div className = 'overflow-y-scroll'>{mesages.map(message => {return<div className = {message.sender === loggedinUserId ? "text-right" : "text-left"}><div className = {"text-left inline-block p-2 rounded-sm text-sm mb-8 " + (message.sender === loggedinUserId ? "bg-blue-500 text-white" : "bg-white text-gray-500")}>{message.text}</div></div>})}</div>}
                    {selectedUserId && <div className = 'flex gap-2'>
                        <input type = 'text' value = {newMessageText} onChange = {e => setNewMessageText(e.target.value)} placeholder = "type your message here" className = 'bg-white border flex-grow p-2 rounded-sm'></input>
                        <button onClick = {sendMessage} className = 'bg-blue-500 text-white p-2 rounded-sm'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>
</button>
                    </div>}
                </div>
            </div>
        )
    }
}

export default Chat