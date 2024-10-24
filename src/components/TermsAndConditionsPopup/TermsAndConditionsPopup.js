import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui/modal';

const TermsAndConditionsPopup = ({ isOpen, onClose, onAccept, termsContent }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    setIsAccepted(true);
    onAccept();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>Terms and Conditions</Modal.Header>
      <Modal.Body>
        <div className="max-h-96 overflow-y-auto">
          {termsContent}
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mr-2"
            />
            I have read and agree to the terms and conditions
          </label>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="outline">Cancel</Button>
        <Button onClick={handleAccept} disabled={!isAccepted}>Accept & Continue</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TermsAndConditionsPopup;