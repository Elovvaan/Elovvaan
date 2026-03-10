import { LegalTemplate } from '@/components/legal-template';

export default function TosPage() {
  return (
    <LegalTemplate
      title="Terms of Service"
      intro="By using Swipe2Win, you agree to these terms governing account use and platform participation."
      bullets={[
        'You must be eligible by age and location to enter sweepstakes.',
        'Only one account per user is allowed unless explicitly authorized.',
        'Abuse, fraud, or manipulation may lead to suspension and prize forfeiture.'
      ]}
    />
  );
}
