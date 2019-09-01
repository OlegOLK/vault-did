import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ITodoItem } from 'src/app/models/rule';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  private todos:ITodoItem[] = [];

  private text:string ='';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.fetchTodos().then(items=>{
      this.todos = items;
    });
  }

  public add(){
    this.authService.createTodo(this.text).then(x=> console.log('aaa', x));
  }

  public share(){
    this.authService.shareTodos("did:test:d67490c3-8642-4228-acc0-0a8616663e84").then(x=> console.log('ppc', x));
  }
}
