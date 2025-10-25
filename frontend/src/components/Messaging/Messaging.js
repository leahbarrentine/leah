import React, { useState, useEffect } from 'react';
import { messageAPI, generalAPI } from '../../api';
import './Messaging.css';

function Messaging({ userId, userType, preSelectedRecipient, initialMessage, directChatOnly = false }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [recipientList, setRecipientList] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(preSelectedRecipient || null);
  const [loading, setLoading] = useState(true);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);

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
    setShowNewChatDropdown(false); // Close new chat dropdown
    
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
    setShowNewChatDropdown(true);
  };
  
  const selectNewRecipient = (recipient) => {
    setSelectedRecipient({
      id: recipient.id,
      type: userType === 'student' ? 'teacher' : 'student',
      name: recipient.name
    });
    setShowNewChatDropdown(false);
    setSelectedConversation({
      partner_id: recipient.id,
      partner_type: userType === 'student' ? 'teacher' : 'student',
      messages: []
    });
  };
  
  // Get users not yet chatted with
  const getAvailableRecipients = () => {
    const conversationPartnerIds = conversations.map(conv => conv.partner_id);
    return recipientList.filter(recipient => !conversationPartnerIds.includes(recipient.id));
  };
  
  const availableRecipients = getAvailableRecipients();

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className={`messaging-container ${directChatOnly ? 'direct-chat-only' : ''}`}>
      {!directChatOnly && (
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
                // Calculate unread count for INCOMING messages only
                const incomingUnreadCount = conv.messages.filter(m => 
                  !m.read && m.recipient_id === userId && m.recipient_type === userType
                ).length;
                
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
                    {incomingUnreadCount > 0 && (
                      <div className="unread-badge">{incomingUnreadCount}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="message-content">
        {showNewChatDropdown ? (
          <div className="new-chat-selection">
            <h3>Start a New Conversation</h3>
            <p>Select a {userType === 'student' ? 'teacher' : 'student'} to message:</p>
            <div className="available-recipients-list">
              {availableRecipients.length === 0 ? (
                <p className="no-recipients">You've already started conversations with everyone!</p>
              ) : (
                availableRecipients.map(recipient => (
                  <div
                    key={recipient.id}
                    className="recipient-option"
                    onClick={() => selectNewRecipient(recipient)}
                  >
                    <div className="recipient-name">{recipient.name}</div>
                    <div className="recipient-email">{recipient.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : !selectedConversation && !selectedRecipient ? (
          <div className="empty-state">
            <p>Select a conversation or start a new one</p>
          </div>
        ) : (
          <>
            <div className="message-header">
              <h3>
                {selectedRecipient?.name || 'Select Recipient'}
              </h3>
            </div>

            <div className="messages-list">
              {selectedConversation?.messages
                ?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((msg) => {
                const isSent = msg.sender_id === userId && msg.sender_type === userType;
                const senderName = isSent ? 'You' : selectedRecipient?.name || 'Unknown';
                
                return (
                  <div
                    key={msg.id}
                    className={`message ${isSent ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-sender">{senderName}</div>
                      <div className="message-content-text">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
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