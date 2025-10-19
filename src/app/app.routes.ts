// src/app/app.routes.ts
// Explanation: Applied AuthGuard to all protected routes under AppLayoutComponent.
// - Added RoleGuard to specific routes, e.g., admin-only like 'ewm-storage-bin-rules' requires ['Admin', 'SuperAdmin'].
// - Add more data: { roles: [...] } as needed for other routes.
// - Signin/Signup are public.
import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { EWMAturizedStatusComponent } from './pages/ewm-aturized-status/ewm-aturized-status.component';
import { EWMParckDisplayGroupeComponent } from './pages/ewm-parck-display-groupe/ewm-parck-display-groupe.component';
import { EwmStorageBinTypeComponent } from './pages/ewm-storage-bin-type/ewm-storage-bin-type.component';
import { EwmStorageBinGroupeComponent } from './pages/ewm-storage-bin-groupe/ewm-storage-bin-groupe.component';
import { EwmStorageTypeComponent } from './pages/ewm-storage-type/ewm-storage-type.component';
import { EwmStorageBinsComponent } from './pages/ewm-storage-bins/ewm-storage-bins.component';
import { EwmStorageBinDetailsComponent } from './pages/ewm-storage-bin-details/ewm-storage-bin-details.component';
import { HandlingUnitsComponent } from './pages/handling-units/handling-units.component';
import { StockMovementsComponent } from './pages/stock-movements/stock-movements.component';
import { BinListComponent } from './groups/bin-list/bin-list.component';
import { GroupFormComponent } from './groups/group-form/group-form.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { BinFormComponent } from './groups/bin-form/bin-form.component';
import { StorageBinRulesComponent } from './pages/storage-bin-rules/storage-bin-rules.component';
import { EwmStorageTypeRulesComponent } from './pages/ewm-storage-type-rules/ewm-storage-type-rules.component';
import { HandlingUnitTransactionsComponent } from './groups/handling-unit-transactions/handling-unit-transactions.component';
import { AuthGuard } from './guards/auth.guard'; // Import AuthGuard
import { RoleGuard } from './guards/role.guard'; // Import RoleGuard
import { UsersManagementComponent } from './pages/users-management/users-management.component';
import { WorkCenterComponent } from './pages/work-center/work-center.component';
import { CharacteristicComponent } from './pages/characteristic/characteristic.component';
import { ClassificationComponent } from './pages/classification/classification.component';
import { ControlModelComponent } from './pages/control-model/control-model.component';
import { MaterialComponent } from './pages/material/material.component';
import { CharacteristicAssignmentComponent } from './pages/characteristic-assignment/characteristic-assignment.component'; // NEW IMPORT
import { EventComponent } from './pages/event/event.component';
import { BomComponent } from './pages/bom/bom.component';
import { RoutingComponent } from './pages/routing/routing.component';
import { ProductionVersionComponent } from './pages/production-version/production-version.component';
import { ProductOrdersComponent } from './pages/product-orders/product-orders.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard], // Protect all child routes with login
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Ecommerce Dashboard ',
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Calender ',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile Dashboard ',
        data: { roles: ['User', 'Admin', 'SuperAdmin'] }
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Form Elements Dashboard ',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] } // Admin-only example
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Basic Tables Dashboard ',
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Blank Dashboard ',
      },
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Invoice Details Dashboard ',
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Line Chart Dashboard ',
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Bar Chart Dashboard ',
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Alerts Dashboard ',
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Avatars Dashboard ',
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Badges Dashboard ',
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Buttons Dashboard ',
      },
      {
        path: 'users',
        component: UsersManagementComponent,
        title: 'User Management',
        canActivate: [RoleGuard],
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Images Dashboard ',
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Videos Dashboard ',
      },
      {
        path: 'aturized-statuses',
        component: EWMAturizedStatusComponent,
        title: 'Authorized Statuses Dashboard ',
      },
      {
        path: 'parck-display-groupes',
        component: EWMParckDisplayGroupeComponent,
        title: 'Park Display Groups Dashboard ',
      },
      {
        path: 'ewm-storage-bin-type',
        component: EwmStorageBinTypeComponent,
        title: 'Park Storage Bin Type ',
      },
      {
        path: 'ewm-storage-bin-groupe',
        component: EwmStorageBinGroupeComponent,
        title: 'Park Storage Bin groupe ',
      },
      {
        path: 'ewm-storage-type',
        component: EwmStorageTypeComponent,
        title: 'Park Storage Type ',
      },
      {
        path: 'ewm-storage-bin-rules',
        component: StorageBinRulesComponent,
        title: 'Storage Bin Rules',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] } // Admin-only
      },
      {
        path: 'storage-bins',
        component: EwmStorageBinsComponent,
        title: 'Storage Bin',
      },
      {
        path: 'storage-bin-details',
        component: EwmStorageBinDetailsComponent,
        title: 'Storage Bin Details',
      },
      {
        path: 'handling-units',
        component: HandlingUnitsComponent,
        title: 'Storage Bin Details',
      },
      {
        path: 'stock-movements',
        component: StockMovementsComponent,
        title: 'Stock Movements',
      },
      { path: 'groups', component: GroupListComponent,title: 'park groups', },
      { path: 'group-form', component: GroupFormComponent, title: 'park group form', },
      { path: 'group-form/:id', component: GroupFormComponent,title: 'group-form', },
      { path: 'bins/:id', component: BinListComponent ,title: 'group bins',},
      { path: 'bin-form/:groupId', component: BinFormComponent ,title: 'add bins',}, // For add
      { path: 'bin-form/:groupId/:binId', component: BinFormComponent ,title: 'edit bins',}, // For edit
      { path: 'storage-bin-rules', component: StorageBinRulesComponent,title:'Storage Bin Rules' },
      { path: 'storage-type-rules', component: EwmStorageTypeRulesComponent },
      // New route for handling unit transactions
      { path: 'handling-unit/:id/transactions', component: HandlingUnitTransactionsComponent, title: 'Handling Unit Transactions' },
      {
        path: 'work-centers',
        component: WorkCenterComponent, // Import at top if needed: import { WorkCenterComponent } from './pages/work-center/work-center.component';
        title: 'Work Centers Dashboard',
      },
      {
        path: 'characteristics',
        component: CharacteristicComponent,
        title: 'Characteristics Dashboard',
      },
      {
        path: 'classifications', // NEW ROUTE: Add this for the classification page
        component: ClassificationComponent,
        title: 'Classifications Dashboard',
        // Optionally add RoleGuard if needed, e.g., canActivate: [RoleGuard], data: { roles: ['Admin', 'SuperAdmin'] }
      },
      { path: 'control-models', 
        component: ControlModelComponent,
        title:'Controle Modem ' },
      { path: 'materials', 
        component: MaterialComponent,
        title:'Material' },
      // NEW ROUTE: Characteristic Assignments (admin-only example)
      {
        path: 'characteristic-assignments',
        component: CharacteristicAssignmentComponent,
        title: 'Characteristic Assignments Dashboard',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] }
      },
      { path: 'event', 
        component: EventComponent,
        title: 'Event' },
      {
        path: 'boms',
        component: BomComponent,
        title: 'BOMs Dashboard',
        // Optional: canActivate: [RoleGuard], data: { roles: ['Admin', 'SuperAdmin'] }
      },
      { 
        path: 'routings', 
        component: RoutingComponent,
        title: 'Routings Dashboard' 
      },
      { 
  path: 'production-versions', 
  component: ProductionVersionComponent,
  title: 'Production Versions Dashboard' 
},
{ path: 'product-orders', component: ProductOrdersComponent, title: 'Product Orders' },

    ],
  },
  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Sign In Dashboard ',
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Sign Up Dashboard ',
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'NotFound Dashboard ',
  },
];