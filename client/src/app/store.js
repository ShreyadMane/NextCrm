import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import contactsReducer from '../features/contacts/contactsSlice';
import leadsReducer from '../features/leads/leadsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import dealsReducer from '../features/deals/dealsSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import activitiesReducer from '../features/activities/activitySlice';
import companiesReducer from '../features/companies/companiesSlice';
import ticketsReducer from '../features/tickets/ticketsSlice';
import quotationsReducer from '../features/quotations/quotationsSlice';
import invoicesReducer from '../features/invoices/invoicesSlice';
import usersReducer from '../features/users/usersSlice';
import meetingsReducer from '../features/meetings/meetingsSlice';
import callLogsReducer from '../features/callLogs/callLogsSlice';
import productsReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    leads: leadsReducer,
    notifications: notificationsReducer,
    deals: dealsReducer,
    tasks: tasksReducer,
    activities: activitiesReducer,
    companies: companiesReducer,
    tickets: ticketsReducer,
    quotations: quotationsReducer,
    invoices: invoicesReducer,
    users: usersReducer,
    meetings: meetingsReducer,
    callLogs: callLogsReducer,
    products: productsReducer,
  },
});
