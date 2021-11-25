import { Component, OnInit } from '@angular/core';
import { CometChat } from '@cometchat-pro/chat';
import { Router } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userInput: String = '';


  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  AUTH_KEY = '8c2af87f6890a61c052631fde4553ed6aad6a6de';


  onCreate(userName) {
    let user = new CometChat.User(userName);
    user.setName(userName);
    user.setUid(userName.replaceAll(" ", ""))
    CometChat.createUser(user, this.AUTH_KEY).then(
      (user) => {
        console.log('user created', user);
        this.router.navigate(['/login']);
        
        
      },
      (error) => {
        console.log('error', error);
      }
    );
  }

}
