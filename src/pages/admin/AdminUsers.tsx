import { Badge } from '@/components/ui/badge';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', plans: 2, status: 'Active' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', plans: 1, status: 'Active' },
  { id: '3', name: 'James Kim', email: 'james@example.com', plans: 0, status: 'Inactive' },
  { id: '4', name: 'Amara Obi', email: 'amara@example.com', plans: 3, status: 'Active' },
];

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Users</h1>
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Active Plans</th><th className="p-4 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {mockUsers.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-medium text-card-foreground">{u.name}</td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4 text-card-foreground">{u.plans}</td>
                <td className="p-4"><Badge variant="secondary" className={u.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}>{u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
