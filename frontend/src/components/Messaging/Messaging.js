import React, { useState, useEffect } from 'react';
import { messageAPI, generalAPI } from '../../api';
import './Messaging.css';

function Messaging({ userId, userType, preSelectedRecipient, initialMessage }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [recipientList, setRecipientList] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(preSelectedRecipient || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadRecipients();
  }, [userId, userType]);

  useEffect(() => {
    if (preSelectedRecipient) {
      setSelectedRecipient(preSelectedRecipient);
      // Find or create conversation with this recipient
      const conv = conversations.find(c => 
        c.partner_id === preSelectedRecipient.id && 
        c.partner_type === preSelectedRecipient.type
      );
      setSelectedConversation(conv || {
        partner_id: preSelectedRecipient.id,
        partner_type: preSelectedRecipient.type,
        messages: []
      });
    }
  }, [preSelectedRecipient, conversations]);

  useEffect(() => {
    if (initialMessage) {
      setNewMessage(initialMessage);
    }
  }, [initialMessage]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations(userId, userType);
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setLoading(false);
  };

  const loadRecipients = async () => {
    try {
      // Load teachers if student, students if teacher
      const response = userType === 'student' 
        ? await generalAPI.getTeachers()
        : await generalAPI.getStudents();
      setRecipientList(response.data);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient) return;

    try {
      await messageAPI.sendMessage({
        sender_id: userId,
        sender_type: userType,
        recipient_id: selectedRecipient.id,
        recipient_type: selectedRecipient.type,
        content: newMessage
      });

      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    
    // Find recipient info
    const recipientType = conv.partner_type;
    const recipient = recipientList.find(r => r.id === conv.partner_id);
    
    if (recipient) {
      setSelectedRecipient({
        id: recipient.id,
        type: recipientType,
        name: recipient.name
      });
    }

    // Mark messages as read
    const unreadMessages = conv.messages.filter(m => 
      !m.read && m.recipient_id === userId && m.recipient_type === userType
    );
    
    for (const msg of unreadMessages) {
      try {
        await messageAPI.markAsRead(msg.id);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setSelectedRecipient(null);
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="messaging-container">
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h3>Messages</h3>
          <button className="button" onClick={startNewConversation}>
            New
          </button>
        </div>
        
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="no-conversations">No messages yet</p>
          ) : (
            conversations.map((conv, idx) => {
              const partner = recipientList.find(r => r.id === conv.partner_id);
              return (
                <div
                  key={idx}
                  className={`conversation-item ${selectedConversation === conv ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conversation-info">
                    <strong>{partner?.name || 'Unknown'}</strong>
                    <span className="message-preview">
                      {conv.messages[0]?.content.substring(0, 40)}...
                    </span>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="unread-badge">{conv.unread_count}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="message-content">
        {!selectedConversation && !selectedRecipient ? (
          <div className="empty-state">
            <p>Select a conversation or start a new one</p>
          </div>
        ) : (
          <>
            <div className="message-header">
              <h3>
                {selectedRecipient?.name || 'Select Recipient'}
              </h3>
              {!selectedRecipient && (
                <select 
                  value={selectedRecipient?.id || ''} 
                  onChange={(e) => {
                    const recipient = recipientList.find(r => r.id === parseInt(e.target.value));
                    setSelectedRecipient({
                      id: recipient.id,
                      type: userType === 'student' ? 'teacher' : 'student',
                      name: recipient.name
                    });
                  }}
                >
                  <option value="">Select {userType === 'student' ? 'Teacher' : 'Student'}</option>
                  {recipientList.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="messages-list">
              {selectedConversation?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender_id === userId && msg.sender_type === userType ? 'sent' : 'received'}`}
                >
                  <div className="message-content-text">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input-container">
              <textarea
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button className="button" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messaging;