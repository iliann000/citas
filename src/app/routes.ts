import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProfileDetail } from './pages/ProfileDetail';
import { BookAppointment } from './pages/BookAppointment';
import { Appointments } from './pages/Appointments';
import { Notifications } from './pages/Notifications';
import { Messages } from './pages/Messages';
import { ChatWindow } from './pages/ChatWindow';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyProfile } from './pages/MyProfile'; 

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  {
    path: '/',
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: 'profile/:id', Component: ProfileDetail },
          { path: 'profile/edit', Component: MyProfile },
          { path: 'book/:id', Component: BookAppointment },
          { path: 'appointments', Component: Appointments },
          { path: 'notifications', Component: Notifications },
          { path: 'messages', Component: Messages },
          { path: 'chat/:id', Component: ChatWindow },
        ],
      }
    ]
  },
]);