import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListComponent } from './components/list/list.component';


const routes: Routes = [
  { path: 'register', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'add', component: HomeComponent },
  { path: 'view', component: HomeComponent },
  { path: 'list', component: ListComponent },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
