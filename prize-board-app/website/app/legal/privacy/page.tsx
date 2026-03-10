import { LegalTemplate } from '@/components/legal-template';

export default function PrivacyPage() {
  return (
    <LegalTemplate
      title="Privacy Policy"
      intro="We collect only the data needed to operate gameplay, verify eligibility, and deliver rewards."
      bullets={[
        'Profile data and gameplay metrics are used to power rankings and account services.',
        'Personal data is protected with industry-standard safeguards.',
        'Users may request data access or deletion where applicable by law.'
      ]}
    />
  );
}
