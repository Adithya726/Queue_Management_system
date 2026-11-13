import { useRef, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { addToken } from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import { ticket } from '../utils/format';

function AddPerson({ queueId, onAdded }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = personName.trim();
    if (!name || loading) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await addToken(queueId, { personName: name });
      setPersonName('');
      toast.success(`Token ${ticket(data.tokenNumber)} issued to ${data.personName}`);
      await onAdded();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to add this person to the queue.'));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form className="add-bar" onSubmit={handleSubmit}>
      <div className="input-icon">
        <UserPlus size={17} />
        <input
          ref={inputRef}
          className="input"
          value={personName}
          onChange={(event) => setPersonName(event.target.value)}
          placeholder="Enter a name and press Enter"
          aria-label="Person name"
          maxLength={80}
          required
        />
      </div>
      <Button type="submit" disabled={loading || !personName.trim()}>
        <Plus size={16} /> {loading ? 'Adding' : 'Add to queue'}
      </Button>
    </form>
  );
}

export default AddPerson;
