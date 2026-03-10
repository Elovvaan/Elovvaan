import { LegalTemplate } from '@/components/legal-template';

export default function AmoePage() {
  return (
    <LegalTemplate
      title="Alternative Method of Entry (AMOE)"
      intro="Players may submit free mail-in entries as an alternative to in-app gameplay entries."
      bullets={[
        'Send one handwritten entry card per envelope following official format.',
        'Entries must be postmarked and received by published deadlines.',
        'Incomplete or duplicate AMOE submissions may be disqualified.'
      ]}
    />
  );
}
