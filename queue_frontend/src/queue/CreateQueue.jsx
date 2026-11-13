import { useState } from 'react';
import Button from '../components/ui/Button';
import { createQueue } from '../services/queueService';
import { getErrorMessage } from '../services/api';
import './queue.css';

function CreateQueue({ onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createQueue({ name });
      setName('');
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create queue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-queue" onSubmit={handleSubmit}>
      <h2>Create a queue</h2>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="inline-form">
        <div className="form-field">
          <label htmlFor="queueName">Queue name</label>
          <input
            id="queueName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Billing counter"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create queue'}
        </Button>
      </div>
    </form>
  );
}

export default CreateQueue;
