import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CometChat } from '@cometchat-pro/chat';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  userInput: String = '';

  constructor(private router: Router) {}
  onLoginError: boolean = false;
  errorMsg: string = '';
  

  ngOnInit() {
  }

  /**

   * @param {String} UID
   *
   */
  AUTH_KEY = '8c2af87f6890a61c052631fde4553ed6aad6a6de';
  @ViewChild(HomeComponent) users;
  onLogin(UID) {
    CometChat.login(UID, this.AUTH_KEY).then(
      (user) => {
        console.log('Login Successful:', { user });
        localStorage.setItem("UID", UID);
        this.router.navigate(['/home']);
      },
      (error) => {
        console.log('Login failed with exception:', { error });
        this.onLoginError = true;
        this.errorMsg = error.message;
      }
    );
  }
  redirectToRegister(){
    this.router.navigate(['/register']);

  }

}
