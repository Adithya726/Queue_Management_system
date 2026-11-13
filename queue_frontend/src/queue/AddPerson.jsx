import { useState } from 'react';
import Button from '../components/ui/Button';
import { addToken } from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import './queue.css';

function AddPerson({ queueId, onAdded }) {
  const [personName, setPersonName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await addToken(queueId, { personName });
      setPersonName('');
      setSuccess(
        `${response.data.personName} received token #${response.data.tokenNumber}.`
      );
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to add this person to the queue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-person" onSubmit={handleSubmit}>
      <h2>Add a person / generate token</h2>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}
      <div className="inline-form">
        <div className="form-field">
          <label htmlFor="personName">Person name</label>
          <input
            id="personName"
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
            placeholder="Customer name"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Generate token'}
        </Button>
      </div>
    </form>
  );
}

export default AddPerson;
