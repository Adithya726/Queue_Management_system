import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/useToast';
import { createQueue } from '../services/queueService';
import { getErrorMessage } from '../services/api';

function CreateQueue({ onCreated }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) {
      return;
    }
    setLoading(true);
    try {
      await createQueue({ name: trimmed });
      setName('');
      toast.success(`Queue "${trimmed}" created`);
      await onCreated();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create queue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div className="create-bar">
        <div className="form-field">
          <label htmlFor="queueName">New queue</label>
          <input
            id="queueName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Billing counter, Reception, Consultation"
            maxLength={60}
            required
          />
        </div>
        <Button type="submit" disabled={loading || !name.trim()}>
          <Plus size={16} /> {loading ? 'Creating' : 'Create queue'}
        </Button>
      </div>
    </form>
  );
}

export default CreateQueue;
