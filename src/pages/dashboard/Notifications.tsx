import { mockNotifications } from '@/utils/mockData';
import { Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const iconMap = { reminder: Clock, success: CheckCircle, error: AlertTriangle };
const colorMap = { reminder: 'bg-warning/10 text-warning', success: 'bg-accent/10 text-accent', error: 'bg-destructive/10 text-destructive' };

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay updated on your payments</p>
      </div>
      <div className="space-y-3">
        {mockNotifications.map(n => {
          const Icon = iconMap[n.type];
          return (
            <div key={n.id} className={`flex gap-4 rounded-xl border bg-card p-4 shadow-card ${!n.read ? 'border-primary/20' : ''}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[n.type]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-card-foreground">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{n.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
