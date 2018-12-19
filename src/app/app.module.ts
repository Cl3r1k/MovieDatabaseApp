import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

// tslint:disable-next-line:max-line-length
import { MatTabsModule, MatDialogModule, MatCardModule, MatButtonModule, MatGridListModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { DialogDetailsComponent } from '@app/dialogs/dialog-details/dialog-details.component';

@NgModule({
    declarations: [
        AppComponent,
        DialogDetailsComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatTabsModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [DialogDetailsComponent]
})
export class AppModule { }
