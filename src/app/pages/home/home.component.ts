import { Component, Input, OnInit } from '@angular/core';
import { CometChat } from '@cometchat-pro/chat';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  
  // 
  ngAfterContentInit() {
    this.getUserCount;
  }
  // variable declairations
  public messageText: string;
  public messageArray = [];
  public unreadMessageCount;
  public userListData = [];
  public showScreen = false;
  public currentUser;
  public userSelected = false;
  public showUserCount = true;
  public selectedUser = {
    name: '',
    avatar: '',
    uid: '',
    status: '',
    conversationID: '',
    messages: [],
    defaultAvatarImage:
      'https://data-eu.cometchat.io/assets/images/avatars/spiderman.png',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('UID')) {
      let UID = localStorage.getItem('UID');
      this.onLogin(UID);
    } else {
      return;
    }
  }
  // loggin user in
  onLogin(UID) {
    let AUTH_KEY = '8c2af87f6890a61c052631fde4553ed6aad6a6de';
    CometChat.login(UID, AUTH_KEY).then(
      (user) => {
        console.log('Login Successful:', { user });
        this.retriveUserList();
        this.recieveMessage();
        this.currentUser = UID;
        this.onlineUserListener();

        //getting unread message count
        CometChat.getUnreadMessageCountForAllUsers().then(
          (response) => {
            this.unreadMessageCount = response;
            this.getUserCount();
          },
          (error) => {
            console.log('failed fetching count', error);
          }
        );
      },
      (error) => {
        console.log('Login failed with exception:', { error });
      }
    );
  }

  // logging user out
  onLogout() {
    CometChat.logout().then(
      (user) => {
        this.router.navigate(['/login']);
        this.stopListener();
        this.stopOnlineUserListener();
        localStorage.removeItem('UID');

      },
      (error) => {
        console.log('Logout failed', { error });
      }
    );
  }
  // scrolling chat to button by default to see latest message
  scrollToBottom() {
    var messageBody = document.querySelector('.chat-body');
    if (messageBody) {
      messageBody.scrollTop =
        messageBody.scrollHeight - messageBody.clientHeight;
    } else {
      return;
    }
  }
  // converting seconds recived from message object to date
  toDateTime(secs) {
    var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
    t.setUTCSeconds(secs);
    let date = t.toString();
    let newDate = date.split(' ');
    let msgDate = `${newDate[0]}-${newDate[1]}-${newDate[2]}`;
    let msgHour = newDate[4];
    let msgTime = `${msgHour.split(':')[0]}:${msgHour.split(':')[1]}`;
    return msgTime;
  }
 

  //  getting user conversation on clicking the user account card
  fetchUserConversation() {
    console.log(this.selectedUser.uid);
    let UID = this.selectedUser.uid;
    let messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(UID)
      .setLimit(50)
      .build();
    messagesRequest
      .fetchPrevious()
      .then((message) => {
        this.selectedUser.messages = [...message];
        console.log('fetched message', message);
        this.scrollToBottom();
        
        this.selectedUser.messages.forEach((msg) => {
          // console.log(msg.category);
          this.markAsDelivered(msg.id, msg.receiverType);
          this.markAsRead(msg.conversationId, msg.receiverType);
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // scrolling to botton after fetching chat from api
    setTimeout(() => {
      this.scrollToBottom();
      // this. actionButtonHideShow();
    }, 3000);
  }

  //  getting user list on logging in
  @Input() retriveUserList() {
    var limit = 30;
    var usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .build();

    usersRequest.fetchNext().then(
      (userList) => {
        this.userListData = userList;
        console.log('User list received:', userList);
      },
      (error) => {
        console.log('User list fetching failed with error:', error);
      }
    );
  }
  // showing chat section on clicking user account
  selectUserHandler(event): void {
    this.userListData.forEach((elem) => {
      if (event.target.innerText == elem.name) {
        this.selectedUser.name = elem.name;
        this.selectedUser.avatar = elem.avatar;
        this.selectedUser.uid = elem.uid;
        this.selectedUser.status = elem.status;
        this.selectedUser.conversationID = elem.conversationId;
        console.log(this.selectedUser.uid);
        this.userSelected = true;
        this.fetchUserConversation();
      } else {
        console.log('no user found');
      }
    });
    
    this.showUserCount = false;
    this.getUserCount();

  }
  // sending message on enter or send button clicked
  sendMessage(): void {
    if (this.messageText && this.messageText != '') {
      let receiverID = this.selectedUser.uid;
      let messageText = this.messageText;
      let receiverType = CometChat.RECEIVER_TYPE.USER;
      let textMessage = new CometChat.TextMessage(
        receiverID,
        messageText,
        receiverType
      );
      CometChat.sendMessage(textMessage).then(
        () => {
          this.selectedUser.messages.unshift(this.messageText);
          this.fetchUserConversation();
          this.scrollToBottom();
        },
        (error) => {
          console.log('Message sending failed with error:', error);
        }
      );
      // making input field empty after sending message
      this.messageText = '';
    } else {
      return;
    }
  }
  // starting listening server to get messages from user
  recieveMessage() {
    let listenerID = this.selectedUser.uid;
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage) => {
          this.fetchUserConversation();
        },
        // onMediaMessageReceived: mediaMessage => {
        //   this.fetchUserConversation();
        // },
        // onCustomMessageReceived: customMessage => {
        //   this.fetchUserConversation();
        // }
      })
    );
  }
  // stopping listening server
  stopListener() {
    let listenerID = this.selectedUser.uid;
    CometChat.removeMessageListener(listenerID);
  }
  // hiding chat section on back click  in mobile view
  hideChat() {
    this.userSelected = false;
  }

  // sending message as delivered oo server
  markAsDelivered(msgId, rcvrType) {
    let messageId = msgId;
    let receiverId = this.selectedUser.uid;
    let receiverType = rcvrType;
    let senderId = this.currentUser;
    CometChat.markAsDelivered(messageId, receiverId, receiverType, senderId);
  }
  // sending mark message as read to server once the user opens any users chat
  markAsRead(msgId, rcvrType) {
    var messageId = msgId;
    var receiverId = this.selectedUser.uid;
    var receiverType = rcvrType;
    var senderId = this.currentUser;
    CometChat.markAsRead(messageId, receiverId, receiverType, senderId);
  }
  // getting user count on logging in and reloading page
  getUserCount() {
    if(this.showUserCount){
      let unreadeMessage = this.unreadMessageCount;
      document.querySelectorAll('.user-card').forEach(function (elem) {
        if (elem.getAttribute('data-uid') in unreadeMessage) {
          (<HTMLElement>elem).querySelector('.messageCount').innerHTML =
            unreadeMessage[elem.getAttribute('data-uid')];
        } else {
          return;
        }
      });

    }
    else{
      document.querySelectorAll('.user-card').forEach(function (elem) {
        
          (<HTMLElement>elem).querySelector('.messageCount').innerHTML = ""
          
        
      });

    }
   
  }
  // hide show button to delete and edit messages
  // actionButtonHideShow(){
  //   document.querySelectorAll(".message-container").forEach(function(message){
  //     message.addEventListener("click",function(){        
  //       if(message.querySelector<HTMLElement>(".action-btn").classList.contains("hide-btn")){
  //         message.querySelector<HTMLElement>(".action-btn").classList.add('show-btn');
  //         message.querySelector<HTMLElement>(".action-btn").classList.remove('hide-btn');
  //       }
  //       else if(message.querySelector<HTMLElement>(".action-btn").classList.contains("show-btn")){
  //         message.querySelector<HTMLElement>(".action-btn").classList.add('hide-btn');

  //         message.querySelector<HTMLElement>(".action-btn").classList.remove('show-btn');

  //       }
      
      
  //     })
  //     })

  // }
  //edit text function
  editText(e){
    e = e || window.event;
    var target = e.target;
    let messageid = target.closest("p").getAttribute("data-message-id")
    console.log(messageid);
    let message = prompt("edit message");
    if(message && message != ""){
      console.log(message);
      let receiverID = this.selectedUser.uid;
  let messageText = message;
  let receiverType = CometChat.RECEIVER_TYPE.USER;
  let messageId = messageid;
  let textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);
  textMessage.setId(messageId);
  CometChat.editMessage(textMessage).then(
    message => {
      console.log("Message Edited", message);
      this.fetchUserConversation();
    }, error => {
      console.log("Message editing failed with error:", error);
    }
  );

    }
    else{
      return
    }
  
    

  }
  // delete text

  deleteText(e){
    let sure = confirm("are you sure?");
    e = e || window.event;
    var target = e.target;
    
    if(sure){
      console.log(target.closest("p").getAttribute("data-message-id"));
      let messageId = target.closest("p").getAttribute("data-message-id");
      target.closest("p").parentElement.remove()
  
  CometChat.deleteMessage(messageId).then(
    message => {
      console.log("Message deleted", message);
      this.fetchUserConversation();
    }, error => {
      console.log("Message delete failed with error:", error);
    }
  );
  

    }
    else{
      return;
    }

    

    

  }
  // realtime user listener
  onlineUserListener(){
    let listenerID = this.currentUser;

CometChat.addUserListener(
  listenerID,
  new CometChat.UserListener({
    onUserOnline: onlineUser => {
      let userData = onlineUser;
      let userCard = document.querySelector(`[data-uid=${userData.uid}]`)
      userCard.querySelectorAll('img')[1].src = '../../../assets/user/download.jpeg';
      userCard.querySelector('.user-status').innerHTML = "online"

      console.log("On User Online:", { onlineUser });
    },
    onUserOffline: offlineUser => {
      let userData = offlineUser;
      let userCard = document.querySelector(`[data-uid=${offlineUser.uid}]`)
      userCard.querySelectorAll('img')[1].src = '../../../assets/user/7445_status_offline.png';
      userCard.querySelector('.user-status').innerHTML = "offline"
      console.log("On User Offline:", { offlineUser });
    }
  })
);
  }
  stopOnlineUserListener(){
    let listenerID = this.currentUser;
CometChat.removeUserListener(listenerID);
  }
}
