import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { GlobalFieldService } from './global-field.service';
import { ROUTES } from './../common/global-vars';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private baseURL: string = environment.serviceURL;

  constructor(
    private http: HttpClient,
    public router: Router,
    private fieldService: GlobalFieldService
  ) {}

  invokePostWithSession(route, req): Observable<any> {
    req['timestamp'] = Math.floor(Date.now());

    // set the server error to false
    this.fieldService.setServerError(false);

    // add the headers
    const headers = {};

    // send the request
    return this.http
      .post<any>(this.baseURL + '/' + route, req, { headers })
      .pipe(
        map((response) => {
          // console.log('[SUCCESS]', response);

          // Does something on response.data
          // modify the response.data as you see fit.

          // return the modified data:
          return response; // kind of useless
        }),
        catchError((error) => {
          if (error instanceof HttpErrorResponse) {
            if (error.error instanceof ErrorEvent) {
              console.error('Error Event');
            } else {
              console.log(
                `[ERROR STATUS] : ${error.status} ${error.statusText}`
              );
              switch (error.status) {
                case 0: //login
                  // this.router.navigateByUrl('/login');
                  console.log('NOT REACHABLE ERROR');

                  // set the server error to true;
                  this.fieldService.setServerError(true);
                  this.router.navigate([ROUTES.SERVER_ERROR]);
                  break;
                case 401: //login
                  // this.router.navigateByUrl('/login');
                  console.log('LOGIN ERROR');
                  break;
                case 403: //forbidden
                  // this.router.navigateByUrl('/unauthorized');
                  console.log('[UNAUTHORIZED ACCESS');
                  break;
              }
            }
          } else {
            console.error('UNKNOWN ERROR');
          }
          return throwError(error);
        })
      );
  }
}
